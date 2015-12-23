module JustinCredible.SmartHomeMobile.Services {

    /**
     * A data source for the AlertMe API; used to cache data for views etc.
     */
    export class GatewayDataSource {

        //#region Injection

        public static ID = "GatewayDataSource";

        public static get $inject(): string[] {
            return [
                "$rootScope",
                "$q",
                UbusRpc.ID
            ];
        }

        constructor(
            private $rootScope: ng.IRootScopeService,
            private $q: ng.IQService,
            private UbusRpc: UbusRpc) {
        }

        //#endregion

        //#region Home Status

        private _gatewayStatus: any;
        private _gatewayStatusLastUpdated: moment.Moment;

        get homeStatus(): AlertMeApiTypes.HomeStatusGetResult {
            return this._gatewayStatus;
        }

        get homeStatusLastUpdated(): moment.Moment {
            return this._gatewayStatusLastUpdated;
        }

        public refreshHomeStatus(): ng.IPromise<any> {
            var q = this.$q.defer();

            this.UbusRpc.getGatewayStatus().then((result: any) => {
                this._gatewayStatus = result;
                this._gatewayStatusLastUpdated = moment();
                q.resolve(result);
            });

            return q.promise;
        }

        //#endregion
    }
}
