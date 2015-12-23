﻿module JustinCredible.SmartHomeMobile.Controllers {

    export class GatewayController extends BaseController<ViewModels.GatewayViewModel> {

        //#region Injection

        public static ID = "GatewayController";

        public static get $inject(): string[] {
            return [
                "$scope",
                "$location",
                "$ionicHistory",
                Services.Plugins.ID,
                Services.Utilities.ID,
                Services.Preferences.ID,
                Services.UiHelper.ID,
                Services.UbusRpc.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private $location: ng.ILocationService,
            private $ionicHistory: any,
            private Plugins: Services.Plugins,
            private Utilities: Services.Utilities,
            private Preferences: Services.Preferences,
            private UiHelper: Services.UiHelper,
            private UbusRpc: Services.UbusRpc) {
            super($scope, ViewModels.GatewayViewModel);
        }

        //#endregion

        //#region BaseController Overrides

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.viewModel.showSaveButton = false;
            this.viewModel.apiUrl = this.Preferences.ubusRpcUrl;
            this.viewModel.userName = this.Preferences.ubusRpcUserName;
            this.viewModel.password = this.Preferences.ubusRpcPassword;
        }

        //#endregion

        //#region Controller Methods

        protected apiInfo_click(): void {
            var infoMessage1 = "The hub is responsible for controlling communicating with the smart home devices, such as security, locks, power, thermostat, etc.";
            var infoMessage2 = "Currently supported hubs are ones that use the Ubus Rpc API (Smart Home platform). This should be a URL to the root of the AlertMe API such as: https://api.alertme.com/v5";
            var promptMessage = "Would you like to use the default URL for Lowe's Iris Smart Home platform? (http://192.168.8.127/ubus)";

            this.UiHelper.alert(infoMessage1, "Gateway Info").then(() => {
                this.UiHelper.alert(infoMessage2, "Gateway Info").then(() => {
                    this.UiHelper.confirm(promptMessage, "Use Default").then((result: string) => {
                        if (result === Constants.Buttons.Yes) {
                            this.viewModel.apiUrl = "http://192.168.8.127/ubus";
                            this.viewModel.showSaveButton = true;
                        }
                    });
                });
            });
        }

        protected save_click(): void {

            if (!this.viewModel.apiUrl || !this.viewModel.userName || !this.viewModel.password) {
                this.UiHelper.alert("Please ensure all fields are populated.");
                return;
            }

            // If the password has changed, ensure that the new passwords match.
            if (this.viewModel.showConfirmPassword) {
                if (this.viewModel.password !== this.viewModel.confirmPassword) {
                    this.UiHelper.alert("The passwords do not match, please try again.");
                    this.viewModel.password = "";
                    this.viewModel.confirmPassword = "";
                    return;
                }
            }

            // Update the values in the preferences.
            this.Preferences.ubusRpcUrl = this.viewModel.apiUrl;
            this.Preferences.ubusRpcUserName = this.viewModel.userName;
            this.Preferences.ubusRpcPassword = this.viewModel.password;

            // Kick the user back to the settings list view.
            this.Plugins.toast.showShortBottom("Changes have been saved.");
            this.$ionicHistory.goBack();
        }

        protected login_click(): void {
            this.Plugins.toast.showShortBottom("Start login gateway.");
            this.UbusRpc.login().then((result: ng.IHttpPromiseCallbackArg<any>) => {
                // If the API call succeeded, set the new on/off state into
                // the view model.
                //device.onOffState = newOnOffState;
                //var resp = JSON.parse(result.data);
                this.Plugins.toast.showShortBottom(result.data);
                //this.viewModel.session = resp.result[1].ubus_rpc_session;
                this.viewModel.session = result.data.result[1].ubus_rpc_session;
                this.Preferences.ubusRpcSession = this.viewModel.session;
            }, () => {
                // If the API call failed, then preserve the previous state.
                //device.onOffState = oldOnOffState;
                this.Plugins.toast.showShortBottom("Can not login gateway.......................!");
            });
        }
        protected info_click(): void {
            this.Plugins.toast.showShortBottom("Start get gateway status.");
            this.UbusRpc.getGatewayStatus().then((result: ng.IHttpPromiseCallbackArg<any>) => {
                // If the API call succeeded, set the new on/off state into
                // the view model.
                //device.onOffState = newOnOffState;
                this.Plugins.toast.showShortBottom("have been login gateway.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                this.viewModel.session = result.data;
            }, () => {
                // If the API call failed, then preserve the previous state.
                //device.onOffState = oldOnOffState;
                this.Plugins.toast.showShortBottom("Can not sdlkgjsdl;kghW;GLKJE;LKJD;LSDKGJNMAO;RGHWOEGHIq;gqkjeg;eQlogin gateway.......................!");
            });
        }
        //#endregion
    }
}
