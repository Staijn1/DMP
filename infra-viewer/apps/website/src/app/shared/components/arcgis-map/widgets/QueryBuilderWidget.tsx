import Widget from '@arcgis/core/widgets/Widget';
import {property, subclass} from '@arcgis/core/core/accessorSupport/decorators';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import {tsx} from '@arcgis/core/widgets/support/widget';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@subclass('esri.widgets.QueryBuilderWidget')
class QueryBuilderWidget extends Widget {
  constructor() {
    super();
  }

  @property()
  enabled = false

  @property()
  map: WebMap | null = null

  @property()
  view: MapView | null = null

  override postInitialize() {

    console.log('afterCreate');
  }

  override render() {
    console.log(this.map)
    this.view?.when(() => {
      console.log('hh',this.map?.layers);
    });

    console.log('rendering QueryBuilderWidget', this.map?.layers.map((layer) => layer.title));
    return (
      <div className={'esri-widget esri-widget--panel'}>
        <h4 className={'esri-widget__heading'}>Advanced search</h4>
        {/*Create a select box for all the layers in the map*/}
        <select id="layerSelect" onChange={this.onLayerSelectChange}>
          <option value="none">Select a layer</option>
          {this.map?.layers.map((layer) => {
            return <option value={layer.id}>{layer.title}</option>
          })}
        </select>
      </div>

    );
  }

  onLayerSelectChange = (event: any) => {
    const layerId = event.target.value;
    //Get the layer from the map
    const layer = this.map?.findLayerById(layerId) as
      FeatureLayer;
    //Get the layer's fields
    const fields = layer.fields;
    //Create a select box for all the fields in the layer
    const fieldSelect = document.getElementById('fieldSelect');
    fieldSelect?.remove();
    const fieldSelectElement = document.createElement('select');
    fieldSelectElement.id = 'fieldSelect';
    fieldSelectElement.addEventListener('change', this.onFieldSelectChange);
    const fieldSelectOption = document.createElement('option');
    fieldSelectOption.value = 'none';
    fieldSelectOption.text = 'Select a field';
    fieldSelectElement.appendChild(fieldSelectOption);
    fields.forEach((field) => {
        const option = document.createElement('option');
        option.value = field.name;
        option.text = field.alias;
        fieldSelectElement.appendChild(option);
      }
    );
  }

  onFieldSelectChange = (event: any) => {
    const fieldName = event.target.value;
    //Get the layer from the map
    const layerId = (document.getElementById('layerSelect') as HTMLSelectElement).value;
    const layer = this.map?.findLayerById(layerId) as
      FeatureLayer;
    //Get the field from the layer
    const field = layer.fields.find((field) => {
        return field.name === fieldName;
      }
    );
    //Get the field's domain
    const domain = field?.domain;
    if (!domain) return
    //Create a select box for all the domain's coded values
    const valueSelect = document.getElementById('valueSelect');
    valueSelect?.remove();
    const valueSelectElement = document.createElement('select');
    valueSelectElement.id = 'valueSelect';
    const valueSelectOption = document.createElement('option');
    valueSelectOption.value = 'none';
    valueSelectOption.text = 'Select a value';
    valueSelectElement.appendChild(valueSelectOption);
    if ('codedValues' in domain) {
      domain?.codedValues.forEach((codedValue) => {
          const option = document.createElement('option');
          if (typeof codedValue.code === 'string') {
            option.value = codedValue.code;
          }
          option.text = codedValue.name;
          valueSelectElement.appendChild(option);
        }
      );
    }
  }
}

export default QueryBuilderWidget;
