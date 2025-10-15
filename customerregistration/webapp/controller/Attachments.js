sap.ui.define(["sap/ui/core/Element", "sap/ui/unified/FileUploaderParameter", "./BaseController", "sap/m/MessageToast", "sap/ui/unified/library"], function (Element, FileUploaderParameter, __BaseController, MessageToast, sap_ui_unified_library) {
    "use strict";

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
    }
    const BaseController = _interopRequireDefault(__BaseController);
    const FileUploaderHttpRequestMethod = sap_ui_unified_library["FileUploaderHttpRequestMethod"];
    /**
   * @namespace apps.dflc.customerregistrationts
   */
    class Attachments {
        static oBaseController = new BaseController("Attachments");
        static handleUploadPress(oEvent) {
            Attachments.oBaseController.clearAllMessages();
            const oButtonUplaod = oEvent.getSource();
            if (!this.oView) {
                this.oView = Attachments._findView(oButtonUplaod);
            }
            if (!this.oView) {
                MessageToast.show("Error to get view, consult the console.");
                return;
            }
            if (!this.oModel) {
                this.oModel = this.oView.getModel();
            }
            if (this.oModel) {
                const oModelI18n = this.oView.getModel("i18n");
                this.oI18n = oModelI18n?.getResourceBundle();
            } else {
                MessageToast.show("Error to get model, consult the console.");
                return;
            }
            const oFileUploader = Attachments._findControlInRegistry("sap.ui.unified.FileUploader", "fileUploader");
            if (!oFileUploader) {
                let oMessage = this.oI18n.getText("notFoundFileUpload");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success");
                return;
            }
            if (!oFileUploader.getValue()) {
                let oMessage = this.oI18n.getText("selectAtLeastOneFile");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error");
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
            } catch (error) {

                this.oView.setBusy(false);

                const oError = error;

                if (oError) {

                    Attachments.oBaseController.addGenericMessageToMessageManager(oError.message, "error")

                }
            }
        }
        static handleUploadComplete(oEvent, response) {
            this.oView.setBusy(false);
            const oFileUpload = oEvent.getSource();
            const sResponse = oEvent.getParameter("response");
            const iStatus = oEvent.getParameter("status");
            if (iStatus >= 200 && iStatus < 300) {
                let oMessage = this.oI18n.getText("fileUploaded");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success");
                oFileUpload.setValue("");
            } else {
                Attachments.oBaseController.addGenericMessageToMessageManager(sResponse, "error");
            }
            if (!this.oTableAttachments) {
                this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment");
            }
            if (this.oTableAttachments) {
                this.oTableAttachments.getModel()?.refresh(true);
            }
        }
        static handlePressAttachment(oEvent) {
            const source = oEvent.getSource();
            const bc = source.getBindingContext();
            if (bc) {
                const path = bc.getPath();
                const oImage = Attachments._findControlInRegistry("sap.m.Image", "image");
                if (oImage) {
                    oImage.bindElement({
                        path: path
                    });
                }
            }
        }
        static handleAttachmentDelete(oEvent) {
            const oButtonDelete = oEvent.getSource();
            if (!this.oView) {
                this.oView = Attachments._findView(oButtonDelete);
            }
            if (!this.oModel) {
                this.oModel = this.oView.getModel();
            }
            if (!this.oI18n) {
                const oModelI18n = this.oView.getModel("i18n");
                this.oI18n = oModelI18n?.getResourceBundle();
            }
            if (!this.oTableAttachments) {
                this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment");
                if (!this.oTableAttachments) {
                    if (this.oI18n) {
                        Attachments.oBaseController.addGenericMessageToMessageManager(this.oI18n.getText("tableAttachmentsNotFound"), "error");
                        return;
                    } else {
                        MessageToast.show("Erro to seach Attachments Table");
                        return;
                    }
                }
            }
            const oItens = this.oTableAttachments.getSelectedContexts();
            Attachments.oBaseController.clearAllMessages();
            for (const oItem of oItens) {
                this.oModel.remove(`${oItem.getPath()}/$value`, {
                    success: (oData, response) => { }
                    ,
                    error: error => { }
                });
            }
        }
        static handleAttachmentChange(oEvent) {
            const oButtonUplaod = oEvent.getSource();
            Attachments.oBaseController.clearAllMessages();
            if (!this.oView) {
                this.oView = Attachments._findView(oButtonUplaod);
            }
            if (!this.oView) {
                MessageToast.show("Error to get view, consult the console.");
                return;
            }
            if (!this.oModel) {
                this.oModel = this.oView.getModel();
            }
            if (!this.oModel) {
                MessageToast.show("Error to get model, consult the console.");
            }
            if (!this.oI18n) {
                const oModelI18n = this.oView.getModel("i18n");
                this.oI18n = oModelI18n?.getResourceBundle();
            }
            if (!this.oTableAttachments) {
                this.oTableAttachments = Attachments._findControlInRegistry("sap.m.Table", "tableAttachment");
                if (!this.oTableAttachments) {
                    if (this.oI18n) {
                        Attachments.oBaseController.addGenericMessageToMessageManager(this.oI18n.getText("tableAttachmentsNotFound"), "error");
                        return;
                    } else {
                        MessageToast.show("Erro to seach Attachments Table");
                        return;
                    }
                }
            }
            const oItens = this.oTableAttachments.getSelectedContexts();
            if (oItens.length > 1) {
                let oMessage = this.oI18n.getText("selectJustOneLine");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error");
                return;
            } else if (oItens.length == 0) {
                let oMessage = this.oI18n.getText("selectAtLeastOneLine");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error");
                return;
            }
            const oPath = oItens[0].getPath();
            const oFileUploader = Attachments._findControlInRegistry("sap.ui.unified.FileUploader", "fileUploader");
            if (!oFileUploader) {
                let oMessage = this.oI18n.getText("notFoundFileUpload");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "success");
                return;
            }
            if (!oFileUploader.getValue()) {
                let oMessage = this.oI18n.getText("selectAtLeastOneFile");
                Attachments.oBaseController.addGenericMessageToMessageManager(oMessage, "error");
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
            } catch (error) {

                this.oView.setBusy(false);

                const oError = error;

                if (oError) {

                    Attachments.oBaseController.addGenericMessageToMessageManager(oError.message, "error")

                }
            }

        }
        static _findControlInRegistry(sControlType, sIdPartial) {
            // Cast para acessar o registry interno
            const ui5Element = Element;
            if (!ui5Element.registry) {
                console.warn("Registry not found");
                return null;
            }
            const aControls = ui5Element.registry.filter(oControl => {
                return oControl.isA && typeof oControl.isA === 'function' && oControl.isA(sControlType) && oControl.getId && oControl.getId().includes(sIdPartial);
            }
            );
            return aControls.length > 0 ? aControls[0] : null;
        }
        static _findView(startControl) {
            let current = startControl;
            while (current) {
                if (current.byId && current.getController) {
                    return current;
                }
                current = current.getParent();
            }
            return null;
        }
        static _findInAggregations(container, sId) {
            if (!container.mAggregations)
                return null;
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
    return Attachments;
});