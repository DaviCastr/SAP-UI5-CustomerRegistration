import Button from "sap/m/Button";
import Event from "sap/ui/base/Event";
import Element from "sap/ui/core/Element";
import View from "sap/ui/core/mvc/View";
import FileUploaderParameter from "sap/ui/unified/FileUploaderParameter";
import BaseController from "./BaseController";
import { MessageType } from "sap/ui/core/library";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Table from "sap/m/Table";
import ColumnListItem from "sap/m/ColumnListItem";
import Image from "sap/m/Image";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageToast from "sap/m/MessageToast";
import FileUploader from "sap/ui/unified/FileUploader";
import { FileUploaderHttpRequestMethod } from "sap/ui/unified/library";

/**
 * @namespace apps.dflc.customerregistrationts
 */
export default class Attachments {

    private static oBaseController = new BaseController("Attachments")
    private static oI18n: ResourceBundle;
    private static oView: View;
    private static oModel: ODataModel;
    private static oTableAttachments: Table;

    public static handleUploadPress(oEvent: Event) {

        Attachments.oBaseController.clearAllMessages();

        const oButtonUplaod = oEvent.getSource() as Button;

        if (!this.oView) {
            this.oView = Attachments._findView(oButtonUplaod) as View;
        }

        if (!this.oView) {
            MessageToast.show("Error to get view, consult the console.");
            return;
        }

        if (!this.oModel) {
            this.oModel = this.oView.getModel() as ODataModel;
        }

        if (this.oModel) {
            const oModelI18n = this.oView.getModel("i18n") as any;
            this.oI18n = oModelI18n?.getResourceBundle();
        } else {
            MessageToast.show("Error to get model, consult the console.");
            return;
        }

        const oFileUploader = Attachments._findControlInRegistry("sap.ui.unified.FileUploader", "fileUploader") as FileUploader;

        if (!oFileUploader) {
            let oMessage = this.oI18n.getText("notFoundFileUpload") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success" as MessageType,)
            return;
        }

        if (!oFileUploader.getValue()) {
            let oMessage = this.oI18n.getText("selectAtLeastOneFile") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error" as MessageType,)
            return;
        }

        oFileUploader.removeAllHeaderParameters();

        oFileUploader.addHeaderParameter(new FileUploaderParameter({
            name: "slug",
            value: oFileUploader.getValue()
        }));

        oFileUploader.addHeaderParameter(new FileUploaderParameter({
            name: "x-csrf-token",
            value: this.oModel?.getSecurityToken()
        }));

        oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.Post);

        oFileUploader.setUploadUrl('/sap/opu/odata/sap/Y1_SALES_MONITOR_DFLC_SRV/Attachments');

        oFileUploader.setSendXHR(true);

        Attachments.oBaseController.clearAllMessages();

        this.oView.setBusy(true);

        try {
            oFileUploader.upload();
        } catch (error: any) {

            this.oView.setBusy(false);

            const oError: Error = error;

            if (oError) {
                Attachments.oBaseController.addGenericMessageToMessageManager(oError.message, "error" as MessageType,)
            }
        }

    }

    public static handleUploadComplete(oEvent: Event, response: any) {

        this.oView.setBusy(false);

        const oFileUpload = oEvent.getSource() as FileUploader;

        const sResponse = oEvent.getParameter("response");
        const iStatus = oEvent.getParameter("status");

        if (iStatus >= 200 && iStatus < 300) {

            let oMessage = this.oI18n.getText("fileUploaded") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success" as MessageType)

            oFileUpload.setValue("");

        } else {

            Attachments.oBaseController.addGenericMessageToMessageManager(sResponse, "error" as MessageType)

        }


        if (!this.oTableAttachments) {
            this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment") as Table;
        }

        if (this.oTableAttachments) {
            this.oTableAttachments.getModel()?.refresh(true);
        }

    }

    public static handlePressAttachment(oEvent: Event) {

        const source = oEvent.getSource() as ColumnListItem;
        const bc = source.getBindingContext();

        if (bc) {
            const path = bc.getPath();
            const oImage = Attachments._findControlInRegistry("sap.m.Image", "image") as Image;
            if (oImage) {
                oImage.bindElement({
                    path: path

                });
            }

        }

    }

    public static handleAttachmentDelete(oEvent: Event) {

        const oButtonDelete = oEvent.getSource() as Button;

        if (!this.oView) {
            this.oView = Attachments._findView(oButtonDelete) as View;
        }

        if (!this.oModel) {
            this.oModel = this.oView.getModel() as ODataModel;
        }

        if (!this.oI18n) {
            const oModelI18n = this.oView.getModel("i18n") as any;
            this.oI18n = oModelI18n?.getResourceBundle();
        }

        if (!this.oTableAttachments) {
            this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment") as Table;

            if (!this.oTableAttachments) {
                if (this.oI18n) {
                    Attachments.oBaseController.addGenericMessageToMessageManager(this.oI18n.getText("tableAttachmentsNotFound") as string, "error" as MessageType);
                    return;
                } else {
                    MessageToast.show("Erro to seach Attachments Table")
                    return;
                }
            }
        }

        const oItens = this.oTableAttachments.getSelectedContexts();

        Attachments.oBaseController.clearAllMessages();

        for (const oItem of oItens) {
            this.oModel.remove(`${oItem.getPath()}/$value`, {

                success: (oData: any, response: any) => {
                },
                error: (error: any) => {
                }
            });
        }

    }

    public static handleAttachmentChange(oEvent: Event) {

        const oButtonUplaod = oEvent.getSource() as Button;

        Attachments.oBaseController.clearAllMessages();

        if (!this.oView) {
            this.oView = Attachments._findView(oButtonUplaod) as View;
        }

        if (!this.oView) {
            MessageToast.show("Error to get view, consult the console.");
            return;
        }

        if (!this.oModel) {
            this.oModel = this.oView.getModel() as ODataModel;
        }

        if (!this.oModel) {
            MessageToast.show("Error to get model, consult the console.");
        }

        if (!this.oI18n) {
            const oModelI18n = this.oView.getModel("i18n") as any;
            this.oI18n = oModelI18n?.getResourceBundle();
        }


        if (!this.oTableAttachments) {
            this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment") as Table;

            if (!this.oTableAttachments) {
                if (this.oI18n) {
                    Attachments.oBaseController.addGenericMessageToMessageManager(this.oI18n.getText("tableAttachmentsNotFound") as string, "error" as MessageType);
                    return;
                } else {
                    MessageToast.show("Erro to seach Attachments Table")
                    return;
                }
            }
        }

        const oItens = this.oTableAttachments.getSelectedContexts();

        if (oItens.length > 1) {
            let oMessage = this.oI18n.getText("selectJustOneLine") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error" as MessageType,)
            return;
        } else if (oItens.length == 0) {
            let oMessage = this.oI18n.getText("selectAtLeastOneLine") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error" as MessageType,)
            return;
        }

        const oPath = oItens[0].getPath();

        const oFileUploader = Attachments._findControlInRegistry("sap.ui.unified.FileUploader", "fileUploader") as FileUploader;

        if (!oFileUploader) {
            let oMessage = this.oI18n.getText("notFoundFileUpload") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success" as MessageType,)
            return;
        }

        if (!oFileUploader.getValue()) {
            let oMessage = this.oI18n.getText("selectAtLeastOneFile") as string;
            Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error" as MessageType,)
            return;
        }

        oFileUploader.removeAllHeaderParameters();

        oFileUploader.addHeaderParameter(new FileUploaderParameter({
            name: "slug",
            value: oFileUploader.getValue()
        }));

        oFileUploader.addHeaderParameter(new FileUploaderParameter({
            name: "x-csrf-token",
            value: this.oModel?.getSecurityToken()
        }));

        oFileUploader.setHttpRequestMethod(FileUploaderHttpRequestMethod.Put);

        oFileUploader.setSendXHR(true);

        oFileUploader.setUploadUrl(`/sap/opu/odata/sap/Y1_SALES_MONITOR_DFLC_SRV${oPath}/$value`);

        this.oView.setBusy(true);

        try {
            oFileUploader.upload();
        } catch (error: any) {

            this.oView.setBusy(false);

            const oError: Error = error;

            if (oError) {
                Attachments.oBaseController.addGenericMessageToMessageManager(oError.message, "error" as MessageType,)
            }
        }

    }

    private static _findControlInRegistry(sControlType: string, sIdPartial: string): any {
        // Cast para acessar o registry interno
        const ui5Element = Element as any;

        if (!ui5Element.registry) {
            console.warn("Registry not found");
            return null;
        }

        const aControls = ui5Element.registry.filter((oControl: any) => {
            return oControl.isA &&
                typeof oControl.isA === 'function' &&
                oControl.isA(sControlType) &&
                oControl.getId &&
                oControl.getId().includes(sIdPartial);
        });

        return aControls.length > 0 ? aControls[0] : null;
    }

    private static _findView(startControl: any): any {
        let current = startControl;
        while (current) {
            if (current.byId && current.getController) {
                return current;
            }
            current = current.getParent();
        }
        return null;
    }

    private static _findInAggregations(container: any, sId: string): any {
        if (!container.mAggregations) return null;

        for (const aggName in container.mAggregations) {
            const aggregation = container.mAggregations[aggName];
            if (Array.isArray(aggregation)) {
                for (const control of aggregation) {
                    if (control.getId && control.getId().includes(sId)) {
                        return control;
                    }
                }
            } else if (aggregation && aggregation.getId && aggregation.getId().includes(sId)) {
                return aggregation;
            }
        }
        return null;
    }

}
