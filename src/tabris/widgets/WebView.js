import Widget from '../Widget';

const CONFIG = {

  _name: 'WebView',

  _type: 'tabris.WebView',

  _events: {
    navigate: {
      trigger(name, event) {
        let intercepted = false;
        event.preventDefault = function() {
          intercepted = true;
        };
        this.trigger(name, this, event);
        return intercepted;
      }
    },
    load: {
      trigger(name, event) {
        this.trigger('load', this, event);
      }
    },
    download: {
      trigger(name, event) {
        this.trigger('download', this, event);
      }
    },
    message: {
      trigger(name, event) {
        this.trigger('message', this, event);
      }
    }
  },

  _properties: {
    url: {type: 'string', nocache: true},
    html: {type: 'string', nocache: true},
    headers: {type: 'any', default: {}},
    initScript: {type: 'string'}
  }

};

export default class WebView extends Widget.extend(CONFIG) {

  postMessage(data, targetOrigin) {
    this._nativeCall('postMessage', {
      data,
      origin: targetOrigin
    });
    return this;
  }

  _loadData(data, mimeType) {
    this._nativeCall('loadData', {data, mimeType});
  }

}
