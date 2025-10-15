import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageToast from "sap/m/MessageToast";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace apps.dflc.customerregistrationts
 */
export default class Object extends BaseController {

    private oI18n: ResourceBundle;

    /**
     * Called when the object controller is instantiated.
     *
     */
    public onInit() {
        // Model used to manipulate control states. The chosen values make sure,
        // detail page shows busy indication immediately so there is no break in
        // between the busy indication for loading the view's meta data
        var viewModel = new JSONModel({
            busy: true,
            delay: 0
        });
        this.getRouter().getRoute("object")!.attachPatternMatched(this.onObjectMatched, this);
        this.setModel(viewModel, "objectView");

        this.oI18n = this.getResourceBundle();

        this.initializeMessageManageModel();

    }


    //Custom methods
    public onSave(event: Event) {
        const oModel = this.getModel() as ODataModel;
        const oPath = this.getView()?.getBindingContext()?.getPath();

        //Will works if you set "defaultBindingMode": "TwoWay" on model at manifest.json
        const oContent = this.getView()?.getBindingContext()?.getObject();//Dont get the fields with new values, but is for testing

        if (oPath && oContent) {

            this.clearAllMessages();

            oModel.update(oPath, oContent, {
                success: (oData: any, response: any) => { MessageToast.show("Data saved successfully!") },//this._onBindViewSuccess.bind(this),
                error: (Error: any) => { debugger } //this._onBindViewError.bind(this),
            });

        }

        // oModel.submitChanges({
        //     success: this._onSaveSuccess.bind(this),
        //     error: this._onSaveError.bind(this),
        // });

    }

    public onSaveTwo(event: Event) {
        const oModel = this.getModel() as ODataModel;
        const oPath = this.getView()?.getBindingContext()?.getPath();

        if (oModel.hasPendingChanges()) {
            this.clearAllMessages();
            oModel.submitChanges({
                success: (oData: any, response: any) => { MessageToast.show(this.oI18n?.getText("saveSuccessMessage") as string) },//this._onSaveSuccess.bind(this),
                error: (oError: any, response: any) => { debugger },//this._onSaveError.bind(this),
            });
        } else {
            MessageToast.show(this.oI18n?.getText("saveNothingngessage") as string)
        }

    }

    public onCancel(event: Event) {

        const oModel = this.getView()?.getModel() as ODataModel;

        if (!oModel.hasPendingChanges()) {
            MessageToast.show(this.oI18n?.getText("cancelSaveMessage") as string)
            return;

        } else {
            oModel.resetChanges();
        }

    }

    /**
     * Binds the view to the object path.
     *
     * @param event pattern match event in route 'object'
     */
    private onObjectMatched(event: Event) {
        var sObjectId = event.getParameter("arguments").objectId;
        this.bindView("/Customers" + sObjectId);
    }

    /**
     * Binds the view to the object path.
     *
     * @param objectPath path to the object to be bound
     */
    private bindView(objectPath: string) {
        const viewModel = this.getModel<JSONModel>("objectView");

        this.getView()!.bindElement({
            path: objectPath,
            events: {
                change: this.onBindingChange.bind(this),
                dataRequested: function () {
                    viewModel.setProperty("/busy", true);
                },
                dataReceived: function () {
                    viewModel.setProperty("/busy", false);
                }
            }
        });
    }

    private onBindingChange() {
        const view = this.getView()!;
        const viewModel = this.getModel<JSONModel>("objectView");
        const elementBinding = view.getElementBinding();

        // No data for the binding
        if (!elementBinding?.getBoundContext()) {
            this.getRouter().getTargets()!.display("objectNotFound");
            return;
        }

        const detailObject = view.getBindingContext()!.getObject() as { CustomerName: string; Customers: string };
        const id = detailObject.CustomerName;
        const name = detailObject.Customers;

        viewModel.setProperty("/busy", false);
        viewModel.setProperty("/shareSendEmailSubject",
            this.getResourceBundle().getText("shareSendEmailObjectSubject", [id]));
        viewModel.setProperty("/shareSendEmailMessage",
            this.getResourceBundle().getText("shareSendEmailObjectMessage", [name, id, location.href]));
    }
}
