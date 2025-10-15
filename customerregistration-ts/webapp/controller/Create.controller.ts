import MessageToast from "sap/m/MessageToast";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Input from "sap/m/Input";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/Context";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

interface CustomerData {
    CustomerName?: string;
    Phone?: string;
    UF?: string;
    Email?: string;
    Status?: string;
}

interface CreateResponse {
    CustomerID: string;
}

/**
 * @namespace apps.dflc.customerregistrationts
 */
export default class Create extends BaseController {

    private oI18n: ResourceBundle;

    public onInit(): void {
        // apply content density mode to root view
        this.getView()!.addStyleClass(this.getUIComponent().getContentDensityClass());

        var oViewModel = new JSONModel({ copies: 0 });
        this.getView()?.setModel(oViewModel, "view");

        const oRouter = this.getRouter();
        if (oRouter) {
            oRouter.getRoute("create")?.attachPatternMatched(this._onCreateMatched, this);
        }

        //Automatica Message
        this.initializeMessageManageModel();

        this.oI18n = this.getResourceBundle();


        //Message Manage manually
        //const oView = this.getView();

        // if(oView){
        //     sap.ui.getCore().getMessageManager().registerObject(oView, true);
        // }

    }

    private _onCreateMatched(oEvent: Event): void {

        try {
            const oView = this.getView();
            if (!oView) {
                console.error("View not found");
                return;
            }

            // Reset counter in view model
            const oViewModel = oView.getModel("view") as JSONModel;
            if (oViewModel) {
                oViewModel.setProperty("/copies", 0);
            }

            const oModel = oView.getModel() as ODataModel;
            if (!oModel) {
                console.error("OData model not found");
                return;
            }

            oModel.metadataLoaded().then(() => {

                // oModel.setDeferredGroups(["createCustomerId"]);
                // oModel.setChangeGroups({
                //     Customers: {
                //         groupId: "createCustomerId",
                //         changeSetId: "CustomerID",
                //     },
                // });
                const oContext = oModel.createEntry('/Customers', {
                    //groupId: "createCustomerId",
                    properties: {
                        Phone: '1234',
                        Email: 'oi@email.com'
                    }
                }) as Context;

                if (oContext) {
                    oView.bindElement({
                        path: oContext.getPath()
                    });
                } else {
                    console.error("Failed to create entry context");
                }
            }).catch((oError: Error) => {
                console.error("Error loading metadata:", oError);
            });

        } catch (error) {
            console.error("Unexpected error in _onCreateMatched:", error);
        }
    }

    public onSave(oEvent: Event): void {
        const oView = this.getView();
        if (!oView) {
            console.error("View not found");
            return;
        }

        const oModel = oView.getModel() as ODataModel;
        if (!oModel) {
            console.error("Model not found");
            return;
        }

        // Check if controls exist
        const oInpName = oView.byId("inpCustomerName") as Input;
        const oInpPhone = oView.byId("inpCustomerPhone") as Input;
        const oInpState = oView.byId("inpCustomerUF") as Input;
        const oInpEmail = oView.byId("inpCustomerEmail") as Input;

        if (!oInpName || !oInpPhone || !oInpState || !oInpEmail) {
            MessageToast.show("Required fields not found");
            return;
        }

        // Validate required data
        if (!oInpName.getValue().trim()) {
            MessageToast.show("Name is required");
            return;
        }

        const data: CustomerData = {
            CustomerName: oInpName.getValue(),
            Phone: oInpPhone.getValue(),
            UF: oInpState.getValue(),
            Email: oInpEmail.getValue(),
            Status: "1"
        };

        this.clearAllMessages();

        oModel.create("/Customers", data, {
            success: (data: CreateResponse, response: any) => {
                MessageToast.show('Client created successfully.');

                //NAvigation back
                this.onNavBack();
                // Navigate to details screen
                // const oRouter = this.getRouter();
                // if (oRouter && data.CustomerID) {
                //     oRouter.navTo("object", {
                //         objectId: `('${data.CustomerID}')` 
                //     });
                // }
            },
            error: (e: any) => {
                console.error("Error creating client:", e);
                let errorMessage = "Error creating client";

                if (e.responseText) {
                    try {
                        const oError = JSON.parse(e.responseText);
                        errorMessage = oError.error?.message?.value || errorMessage;
                    } catch (parseError) {
                        // Ignore parse error
                    }
                }

                MessageToast.show(errorMessage);
            }
        });
    }

    private async onSaveTwo(oEvent: Event): Promise<void> {

        const oView = this.getView();
        if (!oView) {
            console.error("View not found");
            return;
        }

        const oModel = oView.getModel() as ODataModel;
        if (!oModel) {
            console.error("Model not found");
            return;
        }

        try {
            oView.setBusy(true);

            // Get number of copies
            const oViewModel = oView.getModel("view") as JSONModel;
            if (!oViewModel) {
                throw new Error("View model not found");
            }

            const iCopies: number = oViewModel.getProperty("/copies") || 0;
            if (iCopies < 0) {
                MessageToast.show("No copies to create");
                return;
            }

            // Get client data
            const oBindingContext = oView.getBindingContext();
            if (!oBindingContext) {
                throw new Error("Binding context not found");
            }

            const oNewCliente: CustomerData = oBindingContext.getObject();
            if (!oNewCliente?.CustomerName) {
                throw new Error("Invalid client data");
            }

            // Create copies
            for (let i = 0; i < iCopies; i++) {
                oModel.createEntry('/Customers', {
                    properties: {
                        CustomerName: `${oNewCliente.CustomerName} (Copy ${i + 1})`,
                        UF: oNewCliente.UF,
                        Email: oNewCliente.Email,
                        Phone: oNewCliente.Phone,
                    }
                });
            }

            // Submit changes
            await this._submitChanges(oModel);

        } catch (error) {
            console.error("Error creating client copies:", error);
            this._handleError(error);
        } finally {
            oView.setBusy(false);
        }
    }

    public onCancel(event: Event) {

        const oModel = this.getView()?.getModel() as ODataModel;

        if (!oModel.hasPendingChanges()) {
            MessageToast.show(this.oI18n?.getText("cancelSaveMessage") as string)
            return;

        }else{
            oModel.resetChanges();
            this.onNavBack();
        }

    }

    private _submitChanges(oModel: ODataModel): Promise<void> {
        return new Promise((resolve, reject) => {
            this.clearAllMessages();
            oModel.submitChanges({
                success: (oData: any, response: any) => {
                    const sSuccessMessage = (this.oI18n as ResourceBundle)?.getText("saveSuccessMessage") || "Saved successfully";
                    MessageToast.show(sSuccessMessage);
                    oModel.resetChanges();
                    resolve(this.onNavBack());
                },
                error: (oError: any, response: any) => {
                    console.error("Submit error:", oError);
                    // Remove debugger for production
                    debugger; // Consider removing this in production
                    reject(oError);
                },
            });
        });
    }

    private _handleError(error: any): void {
        const sErrorMessage = (this.oI18n as ResourceBundle)?.getText("saveErrorMessage") || "Error occurred";
        MessageToast.show(sErrorMessage);
    }
}
