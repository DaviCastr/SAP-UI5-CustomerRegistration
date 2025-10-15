import ResourceBundle from "sap/base/i18n/ResourceBundle";
import { URLHelper } from "sap/m/library";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import History from "sap/ui/core/routing/History";
import Router from "sap/ui/core/routing/Router";
import AppComponent from "../Component";
import { numberUnit } from "../model/formatter";
import MessageManager from "sap/ui/core/message/MessageManager";
import Message from "sap/ui/core/message/Message";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import JSONModel from "sap/ui/model/json/JSONModel";
import { MessageType } from "sap/ui/core/library";
import Fragment from "sap/ui/core/Fragment";
import MessagePopover from "sap/m/MessagePopover";
import Event from "sap/ui/base/Event";
import Button from "sap/m/Button";
import Control from "sap/ui/core/Control";

/**
 * @namespace apps.dflc.customerregistrationts
 */
export default class BaseController extends Controller {

    private oMessagePopover: MessagePopover;

    public readonly formatter = {
        numberUnit
    };

    /**
     * Convenience method for accessing the owner component.
     *
     * @returns the owner component
     */
    protected getUIComponent(): AppComponent {
        return super.getOwnerComponent() as AppComponent;
    }

    /**
     * Convenience method for accessing the router in every controller of the application.
     *
     * @returns the router for this component
     */
    protected getRouter(): Router {
        return this.getUIComponent().getRouter();
    }

    /**
     * Convenience method for getting the view model by name in every controller of the application.
     *
     * @param name the model name
     * @returns the model instance
     */
    protected getModel<T extends Model>(name?: string): T {
        return this.getView()!.getModel(name) as T;
    }

    /**
     * Convenience method for setting the view model in every controller of the application.
     *
     * @param model the model instance
     * @param name the model name
     * @returns the view instance
     */
    protected setModel(model: Model, name: string): View {
        return this.getView()!.setModel(model, name);
    }

    /**
     * Convenience method for getting the resource bundle.
     *
     * @returns the resourceBundle of the component
     */
    public getResourceBundle(): ResourceBundle {
        return (this.getUIComponent().getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

    /**
     * Event handler for navigating back.
     * It there is a history entry we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the list route.
     * 
     */
    protected onNavBack() {
        if (History.getInstance().getPreviousHash() !== undefined) {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        } else {
            this.getRouter().navTo("worklist", {});
        }
    }

    /**
     * Event handler when the share by E-Mail button has been clicked.
     * 
     */
    public onShareEmailPress() {
        const viewModel = (this.getModel("objectView") || this.getModel("worklistView"));
        URLHelper.triggerEmail(
            undefined,
            viewModel.getProperty("/shareSendEmailSubject"),
            viewModel.getProperty("/shareSendEmailMessage")
        );
    }

    //Custom methods
    protected initializeMessageManageModel() {
        const oView = this.getView();
        if (oView) {
            const oMessageManagerModel = oView.getModel("messageManager");
            if (!oMessageManagerModel) {
                oView.setModel(this._getMessageManager().getMessageModel(), "messageManager")
            }
        }
    }
    /**
     * Global MessageManager
     */
    private _getMessageManager(): MessageManager {
        return sap.ui.getCore().getMessageManager();
    }

    /**
     * Limpa todas as mensagens
     */
    public clearAllMessages(): void {
        this._getMessageManager().removeAllMessages();
    }

    public AddMessageToMessageManager(message: Message) {

        this._getMessageManager().addMessages(message);

    }

    public addGenericMessageToMessageManager(
        message: string,
        type: MessageType = MessageType.Information,
        model?: JSONModel | ODataModel,
        target: string = ""
    ): void {

        const oMessage = new Message({
            message: message,
            type: this._convertMessageType(type),
            target: target,
            processor: model,
            persistent: false
        });

        this.AddMessageToMessageManager(oMessage);
    }

    public startManageManageModel(view: View) {
        const oMessageManager = this._getMessageManager();
        //oMessageManager.registerMessageProcessor(oMessageProcessor);

        view.setModel(oMessageManager.getMessageModel(), "messageManager")
    }

    public onMessagePopoverPress(oEvent: Event) {
        var oSourceControl = oEvent.getSource() as Button;
        this._getMessagePopover().then(
            (oMessagePopover) => {
                oMessagePopover.openBy(oSourceControl);
            }

        );
    }

    // método para instanciar o fragment
    private async _getMessagePopover(): Promise<MessagePopover> {

        const oView = this.getView();

        if (!this.oMessagePopover && oView) {
            this.oMessagePopover = await Fragment.load({
                id: oView.getId(),
                name: "apps.dflc.customerregistrationts.view.MessagePopover"
            }).then((oMessagePopover: Control | Control[]) => {

                const oMessagePopoverObject = Array.isArray(oMessagePopover) ? oMessagePopover[0] : oMessagePopover;

                oView.addDependent(oMessagePopoverObject as MessagePopover);
                this.oMessagePopover = oMessagePopoverObject as MessagePopover;
                return oMessagePopover as MessagePopover;

            });
        }

        return this.oMessagePopover;
    }

    private _convertMessageType(backendType: string): MessageType {
        if (!backendType) return MessageType.Information;

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

}