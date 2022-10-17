import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpService} from 'nestjs-http-promise';
import {FeatureCollection} from 'geojson';
import {logger} from 'nx/src/utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

type FeatureCollectionExtended = FeatureCollection & {
  exceededTransferLimit: boolean;
};

@Injectable()
export class ScraperService {
  list = [
    {name: 'VRI_kasten', url: 'https://geo.arnhem.nl/arcgis/rest/services/Buitendienst/Buitendienst/MapServer/72'},
    {name: 'VRI_masten', url: 'https://geo.arnhem.nl/arcgis/rest/services/Buitendienst/Buitendienst/MapServer/71'},
    {
      name: 'kabels_laagspanning',
      url: 'https://geo.arnhem.nl/arcgis/rest/services/Buitendienst/Buitendienst/MapServer/70'
    },
    {name: 'ondergrondse_tanks', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_Bodem/MapServer/4/'},
    {
      name: 'hemelwaterafvoer',
      url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_Klimaat/MapServer/0/query'
    },
    {name: 'meldingenOR', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Meldingen_OR/FeatureServer/query'},
    {name: 'masten', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/27/query'},
    {name: 'verkeersborden', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/70/query'},
    {name: 'putten', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/13/query'},
    {name: 'strengen', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/14/query'},
    {name: 'kasten', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/28/query'},
    {name: 'kabels', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/30/query'},
    {name: 'OV_Meubilair', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/29/query'},
    {name: 'mantelbuis', url: 'https://geo.arnhem.nl/arcgis/rest/services/Geoweb/Arnhem_BOR/MapServer/31/query'},
  ]

  constructor(private readonly httpService: HttpService) {

  }

  async run() {
    const outputPathRoot = path.join(__dirname, 'assets');
    for (const url of this.list) {
      const completeJSON = await this.fetchAllFeaturesForURL(url.url);
      const outputPath = path.join(outputPathRoot, url.name + '.geojson');
      // Write the GeoJSON to a file
      await fs.writeFile(outputPath, JSON.stringify(completeJSON));
      logger.info('Wrote file to ' + outputPath);
    }
  }


  private async fetchAllFeaturesForURL(url: string) {
    // Create a GeoJSON object containing all the features
    const completeJSON = {
      type: 'FeatureCollection',
      features: []
    };

    // Get the first page

    let page
    do {
      page = await this.getPage(url, completeJSON.features.length);
      completeJSON.features = completeJSON.features.concat(page.features);
    }
    while ((page as FeatureCollectionExtended).exceededTransferLimit)
    return completeJSON;
  }


  private async getPage(url: string, featureOffset: number): Promise<FeatureCollection> {
    if (!url.endsWith('/query')) {
      url += '/query';
    }

    const token = 'Cu_dbBsJUiz0MncltiKww_fJdomrISLARt_5K9YJK84T7o3sbi6Dhcfpr6VtLr2z0OfdB4RR0mXWAGveiDKwzG38ZS4rur_uRUkGNe7HwPQ8KpM7idtkXZ8V0bl_oyv8aq-whS-UfcpeMLShDISqf8IuLgRYFPlCLAcK5QYAifTNeDXd-fl8o-7fw1howMun5AaZkQ2eGMItYtni0y86kuS3ppN81eFlH1_AKb01rQNrTCQfkW5JQ0lcxYKPw5AR_KNa33Skp5qbMsRz8lVGOg..'
    logger.log(`Fetching page ${featureOffset / 2000} from ${url}`);
    // Build the url
    const params = {
      outFields: '*',
      where: '1=1',
      f: 'geojson',
      resultOffset: featureOffset.toString(),
    }
    const urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        urlSearchParams.set(key, value);
      } else {
        console.warn(`Skipping parameter ${key} because it is not a string`);
      }
    }
    const fullUrl = `${url}?${urlSearchParams.toString()}`;
    const response = await this.httpService.get(fullUrl, {
      headers: {
        Cookie: 'agstoken=' + token
      },

    });

    const hasError = response.statusText !== 'OK' || response.data.error !== undefined;

    if (hasError) {
      const description = `Error fetching data from ${url}`
      throw new InternalServerErrorException(response.data.error, description);
    }

    return response.data;
  }
}
