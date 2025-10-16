import Event from "sap/ui/base/Event";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import ObjectListItem from "sap/m/ObjectListItem";
import BaseController from "./BaseController";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { AggregationBindingInfo, ObjectBindingInfo } from "sap/ui/base/ManagedObject";
import MessageToast from "sap/m/MessageToast";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Button from "sap/m/Button";
import Context from "sap/ui/model/Context";
import ColumnListItem from "sap/m/ColumnListItem";
import { MessageType } from "sap/ui/core/library";
import Object from "./Object.controller";
//import Attachments from "apps/dflc/customerregistrationts/controller/Attachments";

interface CustomerObject {
    CustomerID: string;
    CustomerName: string;
    Phone: string;
    UF: string;
    Email: string;
    Status: string;
}

//Return Delete Customer
interface OdataResponseType {
    headers?: {
        "sap-message"?: string;
        "SAP-Message"?: string;
    };
    statusCode?: string;
    statusText?: string;
}

interface SapMessageType {
    code: string;
    message: string;
    severity: string;
    target: string;
    details: any[];
}

//Extend object
interface ExtendedController {
    onChangeStatusCheck?: (object: CustomerObject) => void;
}

/**
 * @namespace apps.dflc.customerregistrationts
 */
export default class Worklist extends BaseController {

    //IF you want to call static method of class Attachments, you nedd do add on view or fragment .attachmentsHandler.method
    //public attachmentsHandler = Attachments;

    private oI18n: ResourceBundle;

    /**
     * Called when the worklist controller is instantiated.
     *
     */
    public onInit() {
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
    }

    //Methods custom public
    public onSortItems(event: Event) {

        const oSorter = new Sorter('CustomerName', false);
        const oTable = this.byId("table") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;
        // Apply the sorter to the binding of the table to sort the items based on the specified criteria
        oBinding.sort(oSorter);

    }

    public onSearchTwo(event: Event) {

        const tableSearchState: Filter[] = [];
        var sQuery = event.getParameter("query");

        if (sQuery && sQuery.length > 0) {
            tableSearchState.push(new Filter("CustomerName", FilterOperator.Contains, sQuery));
        }

        const oTable = this.byId("table") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;
        oBinding.filter(tableSearchState);

    }

    //READ ODATA v2
    public onPressSearch(event: Event) {

        const oModel = this.getView()?.getModel() as ODataModel;

        oModel.read("/Customers('00001')",
            //Filters
            //Sorter
            {

                success: (data: any) => {
                    // handle successful data retrieval
                },
                error: (error: any) => {
                    // handle error
                }
            });

    }

    public onPressCustomerRead(event: Event) {


        const oFilters: Filter[] = [];
        const oSorter = new Sorter('CustomerID', false);

        const oTable = this.byId("table") as Table;
        const oBinding = oTable.getBindingInfo("items") as AggregationBindingInfo;

        oTable.bindAggregation('items', {
            model: oBinding.model,
            path: '/Customers',
            template: oBinding.template,
            sorter: [oSorter],
            filters: oFilters
        });

    }


    public onCustomerDelete(oEvent: Event) {

        const oModel = this.getView()?.getModel() as ODataModel;
        const oSelectedItem = oEvent.getParameter("listItem");
        const sPath = oSelectedItem.getBindingContext().getPath();

        this.clearAllMessages();

        oModel.remove(sPath, {
            success: (oData: any, response: OdataResponseType) => {

                //this.processSapMessageFromResponse(response, oModel);
                MessageToast.show(this.oI18n?.getText("customerDeletedSuccessfully") as string)

            },
            error: (error: any) => {
                // handle error
                MessageToast.show(this.oI18n?.getText("erroToDeleteCustomer") as string)
            }
        });
    }


    public onCustomerDeleteTwo(oEvent: Event) {
        const oTable = this.byId("table") as Table;
        const oModel = this.getView()?.getModel() as ODataModel;
        const oItens = oTable.getSelectedContexts();

        this.clearAllMessages();

        for (const oItem of oItens) {
            oModel.remove(oItem.getPath(), {

                success: (oData: any, response: OdataResponseType) => {

                    //this.processSapMessageFromResponse(response, oModel);
                    MessageToast.show(this.oI18n?.getText("customerDeletedSuccessfully") as string)
                    
                },
                error: (error: any) => {
                    // handle error
                    MessageToast.show(this.oI18n?.getText("erroToDeleteCustomer") as string)
                }
            });
        }

    }

    public onPressCustomerCreate(oEvent: Event) {

        const oRouter = this.getRouter();
        oRouter.navTo("create", {});

    }

    public onChangeStatus(oEvent: Event): void {
        try {
            const oView = this.getView();
            if (!oView) {
                console.error("View not found");
                return;
            }

            const oSource = oEvent.getSource() as Button;
            if (!oSource) {
                console.error("Event source not found");
                return;
            }

            const oParent = oSource.getParent() as ColumnListItem;
            if (!oParent) {
                console.error("Parent control not found");
                return;
            }

            const oBindingContext = oParent.getBindingContext() as Context;
            if (!oBindingContext) {
                console.error("Binding context not found");
                return;
            }

            const oObject = oBindingContext.getObject() as CustomerObject;
            if (!oObject || !oObject.CustomerID) {
                console.error("Client object or ID not found");
                return;
            }

            if((this as ExtendedController).onChangeStatusCheck){
                 (this as ExtendedController).onChangeStatusCheck!(oObject);
            }

            const oModel = oView.getModel() as ODataModel;
            if (!oModel) {
                console.error("Model not found");
                return;
            }

            this.clearAllMessages();

            oModel.callFunction(
                "/ChangeStatus", {
                method: "GET",
                urlParameters: {
                    CustomerID: oObject.CustomerID
                },
                success: (oData: any, response: OdataResponseType) => {
                    //MessageToast.show('Client status updated successfully.');
                    // Optional: Refresh the data
                    //this.processSapMessageFromResponse(response, oModel);
                    //oModel.refresh();
                },
                error: (e: any) => {
                    console.error("Error updating client status:", e);
                    let errorMessage = "Error updating client status";

                    if (e.message) {
                        errorMessage = e.message;
                    } else if (e.responseText) {
                        try {
                            const oError = JSON.parse(e.responseText);
                            errorMessage = oError.error?.message?.value || errorMessage;
                        } catch (parseError) {
                            // Ignore parse error
                        }
                    }

                    MessageToast.show(errorMessage);
                }
            }
            );

        } catch (error) {
            console.error("Unexpected error in onChangeStatus:", error);
            MessageToast.show("Unexpected error occurred");
        }
    }

    //Add SAP Message on Delete
    public processSapMessageFromResponse(response: OdataResponseType, model?: JSONModel | ODataModel): void {

        if (!response || !response.headers) {
            return;
        }

        // Buscar o header sap-message (case insensitive)
        const sapMessageHeader = response.headers["sap-message"] || response.headers["SAP-Message"];

        if (!sapMessageHeader) {
            return;
        }

        try {
            const oSapMessage: SapMessageType = JSON.parse(sapMessageHeader);

            this.addGenericMessageToMessageManager(oSapMessage.message, oSapMessage?.severity as MessageType, model);

        } catch (error) {
            console.error("Error to process sap-message:", error);
            this.addGenericMessageToMessageManager(`Error ao process message: ${sapMessageHeader}`, MessageType.Error, model);
        }
    }

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
    public onUpdateFinished(event: Event) {
        // update the worklist's object counter after the table update
        const table = event.getSource() as Table;
        const total = event.getParameter("total") as number;
        // only update the counter if the length is final and
        // the table is not empty
        let title: string | undefined;
        if (total && (table.getBinding("items") as ListBinding).isLengthFinal()) {
            title = this.getResourceBundle().getText("worklistTableTitleCount", [total]);
        } else {
            title = this.getResourceBundle().getText("worklistTableTitle");
        }
        this.getModel<JSONModel>("worklistView").setProperty("/worklistTableTitle", title);
    }

    /**
     * Event handler when a table item gets pressed.
     *
     * @param event the table selectionChange event
     */
    public onPress(event: Event) {
        // The source is the list item that got pressed
        this.showObject(event.getSource() as ObjectListItem);
    }

    public onSearch(event: Event) {
        if ((event.getParameters() as any).refreshButtonPressed) {
            // Search field's 'refresh' button has been pressed.
            // This is visible if you select any list item.
            // In this case no new search is triggered, we only
            // refresh the list binding.
            this.onRefresh();
        } else {
            const tableSearchState: Filter[] = [];
            var sQuery = event.getParameter("query");

            if (sQuery && sQuery.length > 0) {
                tableSearchState.push(new Filter("CustomerName", FilterOperator.Contains, sQuery));
            }
            this.applySearch(tableSearchState);
        }
    }

    /**
     * Event handler for refresh event. Keeps filter, sort
     * and group settings and refreshes the list binding.
     *
     */
    public onRefresh() {
        this.byId("table")?.getBinding("items")?.refresh(false);
    }

    /**
     * Shows the selected item on the object page,
     *
     * @param item selected Item
     */
    private showObject(item: ObjectListItem) {
        this.getRouter().navTo("object", {
            objectId: item.getBindingContext()!.getPath().substring("/Customers".length)
        });
    }

    /**
     * Internal helper method to apply both filter and search state together on the list binding.
     *
     * @param tableSearchState An array of filters for the search
     */
    private applySearch(tableSearchState: Filter[]) {
        const table = this.byId("table") as Table;
        const viewModel = this.getModel<JSONModel>("worklistView");
        (table.getBinding("items") as ListBinding).filter(tableSearchState, "Application");
        // changes the noDataText of the list in case there are no filter results
        if (tableSearchState.length !== 0) {
            viewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
        }
    }
}
