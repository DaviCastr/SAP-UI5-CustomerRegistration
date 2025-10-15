sap.ui.define(["./BaseController"], function(__BaseController) {
    "use strict";

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
    }
    const BaseController = _interopRequireDefault(__BaseController);
    /**
   * @namespace apps.dflc.customerregistration
   */
    const App = BaseController.extend("apps.dflc.customerregistration.App", {
        onInit: function _onInit() {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getUIComponent().getContentDensityClass());
        }
    });
    return App;
});