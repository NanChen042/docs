import {
  ExtrudeGeometry
} from "./chunk-R2BC2JKT.js";
import "./chunk-LQ2VYIYD.js";

// node_modules/.pnpm/three@0.162.0/node_modules/three/examples/jsm/geometries/TextGeometry.js
var TextGeometry = class extends ExtrudeGeometry {
  constructor(text, parameters = {}) {
    const font = parameters.font;
    if (font === void 0) {
      super();
    } else {
      const shapes = font.generateShapes(text, parameters.size);
      parameters.depth = parameters.height !== void 0 ? parameters.height : 50;
      if (parameters.bevelThickness === void 0)
        parameters.bevelThickness = 10;
      if (parameters.bevelSize === void 0)
        parameters.bevelSize = 8;
      if (parameters.bevelEnabled === void 0)
        parameters.bevelEnabled = false;
      super(shapes, parameters);
    }
    this.type = "TextGeometry";
  }
};
export {
  TextGeometry
};
//# sourceMappingURL=three_examples_jsm_geometries_TextGeometry__js.js.map
