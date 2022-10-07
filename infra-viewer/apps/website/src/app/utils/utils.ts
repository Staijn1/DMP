import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import PopupTemplate from '@arcgis/core/PopupTemplate';

/**
 * Create an HTML table from an object
 * Uses arcgis styling to create a pretty table
 * @param layer
 */
export const createTablePopup = (layer: GeoJSONLayer | FeatureLayer): PopupTemplate => {
  if (!layer.fields) return new PopupTemplate({content: 'No fields to show'});

  const table = document.createElement('table');
  table.classList.add('esri-widget__table');

  const rows = layer.fields.map((field: any) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');

    td1.classList.add('esri-feature__field-header');
    td1.innerText = field.name;
    td2.innerText = `{${field.name}}`;
    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;
  });

  rows.forEach(row => table.appendChild(row));
  return new PopupTemplate({
    title: layer.title,
    content: table.outerHTML
  })
}
