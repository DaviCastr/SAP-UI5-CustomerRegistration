sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "./BaseController", "sap/ui/model/Sorter", "sap/m/MessageToast", "sap/ui/core/library"], function(Filter, FilterOperator, JSONModel, __BaseController, Sorter, MessageToast, sap_ui_core_library) {
    "use strict";

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
    }
    const BaseController = _interopRequireDefault(__BaseController);
    const MessageType = sap_ui_core_library["MessageType"];
    //import Attachments from "apps/dflc/customerregistration/controller/Attachments";
    //Return Delete Customer
    /**
   * @namespace apps.dflc.customerregistration
   */
    const Worklist = BaseController.extend("apps.dflc.customerregistration.Worklist", {
        /**
     * Called when the worklist controller is instantiated.
     *
     */
        onInit: function _onInit() {
            // Model used to manipulate control states
            const viewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(viewModel, "worklistView");
            this.initializeMessageManageModel();
            this.oI18n = this.getResourceBundle();
        },
        //Methods custom public
        onSortItems: function _onSortItems(event) {
            const oSorter = new Sorter('CustomerName',false);
            const oTable = this.byId("table");
            const oBinding = oTable.getBinding("items");
            // Apply the sorter to the binding of the table to sort the items based on the specified criteria
            oBinding.sort(oSorter);
        },
        onSearchTwo: function _onSearchTwo(event) {
            const tableSearchState = [];
            var sQuery = event.getParameter("query");
            if (sQuery && sQuery.length > 0) {
                tableSearchState.push(new Filter("CustomerName",FilterOperator.Contains,sQuery));
            }
            const oTable = this.byId("table");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(tableSearchState);
        },
        //READ ODATA v2
        onPressSearch: function _onPressSearch(event) {
            const oModel = this.getView()?.getModel();
            oModel.read("/Customers('00001')", //Filters
            //Sorter
            {
                success: data => {// handle successful data retrieval
                }
                ,
                error: error => {// handle error
                }
            });
        },
        onPressCustomerRead: function _onPressCustomerRead(event) {
            const oFilters = [];
            const oSorter = new Sorter('CustomerID',false);
            const oTable = this.byId("table");
            const oBinding = oTable.getBindingInfo("items");
            oTable.bindAggregation('items', {
                model: oBinding.model,
                path: '/Customers',
                template: oBinding.template,
                sorter: [oSorter],
                filters: oFilters
            });
        },
        onCustomerDelete: function _onCustomerDelete(oEvent) {
            const oModel = this.getView()?.getModel();
            const oSelectedItem = oEvent.getParameter("listItem");
            const sPath = oSelectedItem.getBindingContext().getPath();
            this.clearAllMessages();
            oModel.remove(sPath, {
                success: (oData, response) => {
                    //this.processSapMessageFromResponse(response, oModel);
                    MessageToast.show(this.oI18n?.getText("customerDeletedSuccessfully"));
                }
                ,
                error: error => {
                    // handle error
                    MessageToast.show(this.oI18n?.getText("erroToDeleteCustomer"));
                }
            });
        },
        onCustomerDeleteTwo: function _onCustomerDeleteTwo(oEvent) {
            const oTable = this.byId("table");
            const oModel = this.getView()?.getModel();
            const oItens = oTable.getSelectedContexts();
            this.clearAllMessages();
            for (const oItem of oItens) {
                oModel.remove(oItem.getPath(), {
                    success: (oData, response) => {
                        //this.processSapMessageFromResponse(response, oModel);
                        MessageToast.show(this.oI18n?.getText("customerDeletedSuccessfully"));
                    }
                    ,
                    error: error => {
                        // handle error
                        MessageToast.show(this.oI18n?.getText("erroToDeleteCustomer"));
                    }
                });
            }
        },
        onPressCustomerCreate: function _onPressCustomerCreate(oEvent) {
            const oRouter = this.getRouter();
            oRouter.navTo("create", {});
        },
        onChangeStatus: function _onChangeStatus(oEvent) {
            try {
                const oView = this.getView();
                if (!oView) {
                    console.error("View not found");
                    return;
                }
                const oSource = oEvent.getSource();
                if (!oSource) {
                    console.error("Event source not found");
                    return;
                }
                const oParent = oSource.getParent();
                if (!oParent) {
                    console.error("Parent control not found");
                    return;
                }
                const oBindingContext = oParent.getBindingContext();
                if (!oBindingContext) {
                    console.error("Binding context not found");
                    return;
                }
                const oObject = oBindingContext.getObject();
                if (!oObject || !oObject.CustomerID) {
                    console.error("Client object or ID not found");
                    return;
                }
                const oModel = oView.getModel();
                if (!oModel) {
                    console.error("Model not found");
                    return;
                }
                this.clearAllMessages();
                oModel.callFunction("/ChangeStatus", {
                    method: "GET",
                    urlParameters: {
                        CustomerID: oObject.CustomerID
                    },
                    success: (oData, response) => {//MessageToast.show('Client status updated successfully.');
                    // Optional: Refresh the data
                    //this.processSapMessageFromResponse(response, oModel);
                    //oModel.refresh();
                    }
                    ,
                    error: e => {
                        console.error("Error updating client status:", e);
                        let errorMessage = "Error updating client status";
                        if (e.message) {
                            errorMessage = e.message;
                        } else if (e.responseText) {
                            try {
                                const oError = JSON.parse(e.responseText);
                                errorMessage = oError.error?.message?.value || errorMessage;
                            } catch (parseError) {// Ignore parse error
                            }
                        }
                        MessageToast.show(errorMessage);
                    }
                });
            } catch (error) {
                console.error("Unexpected error in onChangeStatus:", error);
                MessageToast.show("Unexpected error occurred");
            }
        },
        //Add SAP Message on Delete
        processSapMessageFromResponse: function _processSapMessageFromResponse(response, model) {
            if (!response || !response.headers) {
                return;
            }

            // Buscar o header sap-message (case insensitive)
            const sapMessageHeader = response.headers["sap-message"] || response.headers["SAP-Message"];
            if (!sapMessageHeader) {
                return;
            }
            try {
                const oSapMessage = JSON.parse(sapMessageHeader);
                this.addGenericMessageToMessageManager(oSapMessage.message, oSapMessage?.severity, model);
            } catch (error) {
                console.error("Error to process sap-message:", error);
                this.addGenericMessageToMessageManager(`Error ao process message: ${sapMessageHeader}`, MessageType.Error, model);
            }
        },
        //AttachmentsMethods
        /**
     * Triggered by the table's 'updateFinished' event: after new table
     * data is available, this handler method updates the table counter.
     * This should only happen if the update was successful, which is
     * why this handler is attached to 'updateFinished' and not to the
     * table's list binding's 'dataReceived' method.
     *
     * @param event the update finished event
     */
        onUpdateFinished: function _onUpdateFinished(event) {
            // update the worklist's object counter after the table update
            const table = event.getSource();
            const total = event.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            let title;
            if (total && table.getBinding("items").isLengthFinal()) {
                title = this.getResourceBundle().getText("worklistTableTitleCount", [total]);
            } else {
                title = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", title);
        },
        /**
     * Event handler when a table item gets pressed.
     *
     * @param event the table selectionChange event
     */
        onPress: function _onPress(event) {
            // The source is the list item that got pressed
            this.showObject(event.getSource());
        },
        onSearch: function _onSearch(event) {
            if (event.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                const tableSearchState = [];
                var sQuery = event.getParameter("query");
                if (sQuery && sQuery.length > 0) {
                    tableSearchState.push(new Filter("CustomerName",FilterOperator.Contains,sQuery));
                }
                this.applySearch(tableSearchState);
            }
        },
        /**
     * Event handler for refresh event. Keeps filter, sort
     * and group settings and refreshes the list binding.
     *
     */
        onRefresh: function _onRefresh() {
            this.byId("table")?.getBinding("items")?.refresh(false);
        },
        /**
     * Shows the selected item on the object page,
     *
     * @param item selected Item
     */
        showObject: function _showObject(item) {
            this.getRouter().navTo("object", {
                objectId: item.getBindingContext().getPath().substring("/Customers".length)
            });
        },
        /**
     * Internal helper method to apply both filter and search state together on the list binding.
     *
     * @param tableSearchState An array of filters for the search
     */
        applySearch: function _applySearch(tableSearchState) {
            const table = this.byId("table");
            const viewModel = this.getModel("worklistView");
            table.getBinding("items").filter(tableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (tableSearchState.length !== 0) {
                viewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }
    });
    return Worklist;
});