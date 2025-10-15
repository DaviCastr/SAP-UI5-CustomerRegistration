sap.ui.define(["sap/m/library", "sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "../model/formatter", "sap/ui/core/message/Message", "sap/ui/core/library", "sap/ui/core/Fragment"], function (sap_m_library, Controller, History, ___model_formatter, Message, sap_ui_core_library, Fragment) {
    "use strict";

    const URLHelper = sap_m_library["URLHelper"];
    const numberUnit = ___model_formatter["numberUnit"];
    const MessageType = sap_ui_core_library["MessageType"];
    /**
   * @namespace apps.dflc.customerregistration
   */
    const BaseController = Controller.extend("apps.dflc.customerregistration.BaseController", {
        constructor: function constructor() {
            Controller.prototype.constructor.apply(this, arguments);
            this.formatter = {
                numberUnit
            };
        },
        /**
     * Convenience method for accessing the owner component.
     *
     * @returns the owner component
     */
        getUIComponent: function _getUIComponent() {
            return Controller.prototype.getOwnerComponent.call(this);
        },
        /**
     * Convenience method for accessing the router in every controller of the application.
     *
     * @returns the router for this component
     */
        getRouter: function _getRouter() {
            return this.getUIComponent().getRouter();
        },
        /**
     * Convenience method for getting the view model by name in every controller of the application.
     *
     * @param name the model name
     * @returns the model instance
     */
        getModel: function _getModel(name) {
            return this.getView().getModel(name);
        },
        /**
     * Convenience method for setting the view model in every controller of the application.
     *
     * @param model the model instance
     * @param name the model name
     * @returns the view instance
     */
        setModel: function _setModel(model, name) {
            return this.getView().setModel(model, name);
        },
        /**
     * Convenience method for getting the resource bundle.
     *
     * @returns the resourceBundle of the component
     */
        getResourceBundle: function _getResourceBundle() {
            return this.getUIComponent().getModel("i18n").getResourceBundle();
        },
        /**
     * Event handler for navigating back.
     * It there is a history entry we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the list route.
     * 
     */
        onNavBack: function _onNavBack() {
            if (History.getInstance().getPreviousHash() !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {});
            }
        },
        /**
     * Event handler when the share by E-Mail button has been clicked.
     * 
     */
        onShareEmailPress: function _onShareEmailPress() {
            const viewModel = this.getModel("objectView") || this.getModel("worklistView");
            URLHelper.triggerEmail(undefined, viewModel.getProperty("/shareSendEmailSubject"), viewModel.getProperty("/shareSendEmailMessage"));
        },
        //Custom methods
        initializeMessageManageModel: function _initializeMessageManageModel() {
            const oView = this.getView();
            if (oView) {
                const oMessageManagerModel = oView.getModel("messageManager");
                if (!oMessageManagerModel) {
                    oView.setModel(this._getMessageManager().getMessageModel(), "messageManager");
                }
            }
        },
        /**
     * Global MessageManager
     */
        _getMessageManager: function _getMessageManager() {
            return sap.ui.getCore().getMessageManager();
        },
        /**
     * Limpa todas as mensagens
     */
        clearAllMessages: function _clearAllMessages() {
            this._getMessageManager().removeAllMessages();
        },
        AddMessageToMessageManager: function _AddMessageToMessageManager(message) {
            this._getMessageManager().addMessages(message);
        },
        addGenericMessageToMessageManager: function _addGenericMessageToMessageManager(message, type = MessageType.Information, model, target = "") {
            const oMessage = new Message({
                message: message,
                type: this._convertMessageType(type),
                target: target,
                processor: model,
                persistent: false
            });
            this.AddMessageToMessageManager(oMessage);
        },
        startManageManageModel: function _startManageManageModel(view) {
            const oMessageManager = this._getMessageManager();
            //oMessageManager.registerMessageProcessor(oMessageProcessor);

            view.setModel(oMessageManager.getMessageModel(), "messageManager");
        },
        onMessagePopoverPress: function _onMessagePopoverPress(oEvent) {
            var oSourceControl = oEvent.getSource();
            this._getMessagePopover().then(oMessagePopover => {
                oMessagePopover.openBy(oSourceControl);
            }
            );
        },
        // método para instanciar o fragment
        _getMessagePopover: async function _getMessagePopover() {
            const oView = this.getView();
            if (!this.oMessagePopover && oView) {
                this.oMessagePopover = await Fragment.load({
                    id: oView.getId(),
                    name: "apps.dflc.customerregistration.view.MessagePopover"
                }).then(oMessagePopover => {
                    const oMessagePopoverObject = Array.isArray(oMessagePopover) ? oMessagePopover[0] : oMessagePopover;
                    oView.addDependent(oMessagePopoverObject);
                    this.oMessagePopover = oMessagePopoverObject;
                    return oMessagePopover;
                }
                );
            }
            return this.oMessagePopover;
        },
        _convertMessageType: function _convertMessageType(backendType) {
            if (!backendType)
                return MessageType.Information;
            const type = backendType.toLowerCase().trim();
            switch (type) {
                case "success":
                    return MessageType.Success;
                case "error":
                    return MessageType.Error;
                case "warning":
                    return MessageType.Warning;
                case "info":
                    return MessageType.Information;
                case "danger":
                    return MessageType.Error;
                default:
                    return MessageType.Information;
            }
        }
    });
    return BaseController;
});