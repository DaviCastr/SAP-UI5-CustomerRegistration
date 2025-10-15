sap.ui.define(["sap/ui/model/json/JSONModel", "./BaseController", "sap/m/MessageToast"], function(JSONModel, __BaseController, MessageToast) {
    "use strict";

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
    }
    const BaseController = _interopRequireDefault(__BaseController);
    /**
   * @namespace apps.dflc.customerregistration
   */
    const Object = BaseController.extend("apps.dflc.customerregistration.Object", {
        /**
     * Called when the object controller is instantiated.
     *
     */
        onInit: function _onInit() {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var viewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.getRouter().getRoute("object").attachPatternMatched(this.onObjectMatched, this);
            this.setModel(viewModel, "objectView");
            this.oI18n = this.getResourceBundle();
            this.initializeMessageManageModel();
        },
        //Custom methods
        onSave: function _onSave(event) {
            const oModel = this.getModel();
            const oPath = this.getView()?.getBindingContext()?.getPath();

            //Will works if you set "defaultBindingMode": "TwoWay" on model at manifest.json
            const oContent = this.getView()?.getBindingContext()?.getObject();
            //Dont get the fields with new values, but is for testing

            if (oPath && oContent) {
                this.clearAllMessages();
                oModel.update(oPath, oContent, {
                    success: (oData, response) => {
                        MessageToast.show("Data saved successfully!");
                    }
                    ,
                    //this._onBindViewSuccess.bind(this),
                    error: Error => {
                        debugger ;
                    }
                    //this._onBindViewError.bind(this),
                });
            }

            // oModel.submitChanges({
            //     success: this._onSaveSuccess.bind(this),
            //     error: this._onSaveError.bind(this),
            // });
        },
        onSaveTwo: function _onSaveTwo(event) {
            const oModel = this.getModel();
            const oPath = this.getView()?.getBindingContext()?.getPath();
            if (oModel.hasPendingChanges()) {
                this.clearAllMessages();
                oModel.submitChanges({
                    success: (oData, response) => {
                        MessageToast.show(this.oI18n?.getText("saveSuccessMessage"));
                    }
                    ,
                    //this._onSaveSuccess.bind(this),
                    error: (oError, response) => {
                        debugger ;
                    }
                    //this._onSaveError.bind(this),
                });
            } else {
                MessageToast.show(this.oI18n?.getText("saveNothingngessage"));
            }
        },
        onCancel: function _onCancel(event) {
            const oModel = this.getView()?.getModel();
            if (!oModel.hasPendingChanges()) {
                MessageToast.show(this.oI18n?.getText("cancelSaveMessage"));
                return;
            } else {
                oModel.resetChanges();
            }
        },
        /**
     * Binds the view to the object path.
     *
     * @param event pattern match event in route 'object'
     */
        onObjectMatched: function _onObjectMatched(event) {
            var sObjectId = event.getParameter("arguments").objectId;
            this.bindView("/Customers" + sObjectId);
        },
        /**
     * Binds the view to the object path.
     *
     * @param objectPath path to the object to be bound
     */
        bindView: function _bindView(objectPath) {
            const viewModel = this.getModel("objectView");
            this.getView().bindElement({
                path: objectPath,
                events: {
                    change: this.onBindingChange.bind(this),
                    dataRequested: function() {
                        viewModel.setProperty("/busy", true);
                    },
                    dataReceived: function() {
                        viewModel.setProperty("/busy", false);
                    }
                }
            });
        },
        onBindingChange: function _onBindingChange() {
            const view = this.getView();
            const viewModel = this.getModel("objectView");
            const elementBinding = view.getElementBinding();

            // No data for the binding
            if (!elementBinding?.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }
            const detailObject = view.getBindingContext().getObject();
            const id = detailObject.CustomerName;
            const name = detailObject.Customers;
            viewModel.setProperty("/busy", false);
            viewModel.setProperty("/shareSendEmailSubject", this.getResourceBundle().getText("shareSendEmailObjectSubject", [id]));
            viewModel.setProperty("/shareSendEmailMessage", this.getResourceBundle().getText("shareSendEmailObjectMessage", [name, id, location.href]));
        }
    });
    return Object;
});