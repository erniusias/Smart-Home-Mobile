module JustinCredible.SmartHomeMobile.Controllers {

    export class GatewayOverviewController extends BaseController<ViewModels.GatewayOverviewViewModel> {

        //#region Injection

        public static ID = "GatewayOverviewController";

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
            super($scope, ViewModels.GatewayOverviewViewModel);
        }

        //#endregion

        //#region BaseController Overrides

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.Plugins.toast.showShortBottom("Start get Systeminfohahahhahahhahahahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh.");
            this.UbusRpc.getGatewayStatus().then((result: ng.IHttpPromiseCallbackArg<any>) => {
                // If the API call succeeded, set the new on/off state into
                // the view model.
                //device.onOffState = newOnOffState;
                this.Plugins.toast.showShortBottom("have get system info.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                this.viewModel.systemInfo = result.data.result[1];
            }, () => {
                // If the API call failed, then preserve the previous state.
                //device.onOffState = oldOnOffState;
                this.Plugins.toast.showShortBottom("Can not sdlkgjsdl;kghW;GLKJE;LKJD;LSDKGJNMAO;RGHWOEGHIq;gqkjeg;eQlogin gateway.......................!");
            });

        }

        //#endregion
    }
}
