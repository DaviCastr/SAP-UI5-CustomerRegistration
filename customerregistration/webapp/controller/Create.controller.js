sap.ui.define(["sap/m/MessageToast", "./BaseController", "sap/ui/model/json/JSONModel"], function(MessageToast, __BaseController, JSONModel) {
    "use strict";

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
    }
    const BaseController = _interopRequireDefault(__BaseController);
    /**
   * @namespace apps.dflc.customerregistration
   */
    const Create = BaseController.extend("apps.dflc.customerregistration.Create", {
        onInit: function _onInit() {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getUIComponent().getContentDensityClass());
            var oViewModel = new JSONModel({
                copies: 0
            });
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
        },
        _onCreateMatched: function _onCreateMatched(oEvent) {
            try {
                const oView = this.getView();
                if (!oView) {
                    console.error("View not found");
                    return;
                }

                // Reset counter in view model
                const oViewModel = oView.getModel("view");
                if (oViewModel) {
                    oViewModel.setProperty("/copies", 0);
                }
                const oModel = oView.getModel();
                if (!oModel) {
                    console.error("OData model not found");
                    return;
                }
                oModel.metadataLoaded().then( () => {
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
                    });
                    if (oContext) {
                        oView.bindElement({
                            path: oContext.getPath()
                        });
                    } else {
                        console.error("Failed to create entry context");
                    }
                }
                ).catch(oError => {
                    console.error("Error loading metadata:", oError);
                }
                );
            } catch (error) {
                console.error("Unexpected error in _onCreateMatched:", error);
            }
        },
        onSave: function _onSave(oEvent) {
            const oView = this.getView();
            if (!oView) {
                console.error("View not found");
                return;
            }
            const oModel = oView.getModel();
            if (!oModel) {
                console.error("Model not found");
                return;
            }

            // Check if controls exist
            const oInpName = oView.byId("inpCustomerName");
            const oInpPhone = oView.byId("inpCustomerPhone");
            const oInpState = oView.byId("inpCustomerUF");
            const oInpEmail = oView.byId("inpCustomerEmail");
            if (!oInpName || !oInpPhone || !oInpState || !oInpEmail) {
                MessageToast.show("Required fields not found");
                return;
            }

            // Validate required data
            if (!oInpName.getValue().trim()) {
                MessageToast.show("Name is required");
                return;
            }
            const data = {
                CustomerName: oInpName.getValue(),
                Phone: oInpPhone.getValue(),
                UF: oInpState.getValue(),
                Email: oInpEmail.getValue(),
                Status: "1"
            };
            this.clearAllMessages();
            oModel.create("/Customers", data, {
                success: (data, response) => {
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
                }
                ,
                error: e => {
                    console.error("Error creating client:", e);
                    let errorMessage = "Error creating client";
                    if (e.responseText) {
                        try {
                            const oError = JSON.parse(e.responseText);
                            errorMessage = oError.error?.message?.value || errorMessage;
                        } catch (parseError) {// Ignore parse error
                        }
                    }
                    MessageToast.show(errorMessage);
                }
            });
        },
        // @ts-ignore
        onSaveTwo: async function _onSaveTwo(oEvent) {
            const oView = this.getView();
            if (!oView) {
                console.error("View not found");
                return;
            }
            const oModel = oView.getModel();
            if (!oModel) {
                console.error("Model not found");
                return;
            }
            try {
                oView.setBusy(true);

                // Get number of copies
                const oViewModel = oView.getModel("view");
                if (!oViewModel) {
                    throw new Error("View model not found");
                }
                const iCopies = oViewModel.getProperty("/copies") || 0;
                if (iCopies < 0) {
                    MessageToast.show("No copies to create");
                    return;
                }

                // Get client data
                const oBindingContext = oView.getBindingContext();
                if (!oBindingContext) {
                    throw new Error("Binding context not found");
                }
                const oNewCliente = oBindingContext.getObject();
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
                            Phone: oNewCliente.Phone
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
        },
        onCancel: function _onCancel(event) {
            const oModel = this.getView()?.getModel();
            if (!oModel.hasPendingChanges()) {
                MessageToast.show(this.oI18n?.getText("cancelSaveMessage"));
                return;
            } else {
                oModel.resetChanges();
                this.onNavBack();
            }
        },
        _submitChanges: function _submitChanges(oModel) {
            // @ts-ignore
            return new Promise( (resolve, reject) => {
                this.clearAllMessages();
                oModel.submitChanges({
                    success: (oData, response) => {
                        const sSuccessMessage = this.oI18n?.getText("saveSuccessMessage") || "Saved successfully";
                        MessageToast.show(sSuccessMessage);
                        oModel.resetChanges();
                        resolve(this.onNavBack());
                    }
                    ,
                    error: (oError, response) => {
                        console.error("Submit error:", oError);
                        // Remove debugger for production
                        debugger ;// Consider removing this in production
                        reject(oError);
                    }
                });
            }
            );
        },
        _handleError: function _handleError(error) {
            const sErrorMessage = this.oI18n?.getText("saveErrorMessage") || "Error occurred";
            MessageToast.show(sErrorMessage);
        }
    });
    return Create;
});