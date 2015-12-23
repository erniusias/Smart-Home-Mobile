module JustinCredible.SmartHomeMobile.Services {

    /**
     * A service wrapper for the UbusRpc API.
     */
    export class UbusRpc {

        //#region Injection

        public static ID = "UbusRpc";

        public static get $inject(): string[] {
            return [
                "$rootScope",
                "$q",
                "$http",
                Preferences.ID,
                Utilities.ID
            ];
        }

        constructor(
            private $rootScope: ng.IRootScopeService,
            private $q: ng.IQService,
            private $http: ng.IHttpService,
            private Preferences: Preferences,
            private Utilities: Utilities) {
        }

        //#endregion

        //#region Event Constants

        public static URL_NOT_SPECIFIED_EVENT = "UbusRpc.URL_NOT_SPECIFIED";
        public static CREDENTIALS_NOT_SPECIFIED_EVENT = "UbusRpc.CREDENTIALS_NOT_SPECIFIED";

        public static URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION = "UbusRpc.URL_OR_CREDENTIALS_NOT_SPECIFIED";
        public static UNKNOWN_ORIGINAL_METHOD_REJECTION = "UbusRpc.UNKNOWN_ORIGINAL_METHOD";

        //#endregion

        //#region Parameter Constants

        public static DEFAULT_RPC_SESSION = "00000000000000000000000000000000"

        //#endregion

        //#region Private Helpers

        /**
         * Used to check if the URL for the AlertMe API service has been configured.
         * 
         * @returns True if the URL has been configured, false otherwise.
         */
        private isUrlSpecified(): boolean {
            return !!this.Preferences.ubusRpcUrl;
        }

        /**
         * Used to check if the AlertMe API credentials have been configured.
         * 
         * @returns True if the credentials have been configured, false otherwise.
         */
        private areCredentialsSpecified(): boolean {
            return !!this.Preferences.ubusRpcUserName && !!this.Preferences.ubusRpcPassword;
        }

        /**
         * Used to determine if all of the pre-conditions for calling the AlertMe API
         * have been satisfied. Currently this checks for the configuration of the URL
         * and credentials.
         * 
         * @returns True if all pre-conditions have been met, false otherwise.
         */
        private arePreconditionsMet(): boolean {
            if (!this.isUrlSpecified()) {
                this.$rootScope.$broadcast(UbusRpc.URL_NOT_SPECIFIED_EVENT);
                return false;
            }
            else if (!this.areCredentialsSpecified()) {
                this.$rootScope.$broadcast(UbusRpc.CREDENTIALS_NOT_SPECIFIED_EVENT);
                return false;
            }
            else {
                return true;
            }
        }

        /**
         * This is used to transform an arbitrary object into a form submission key/value
         * pair string that can be sent over the wire.
         * 
         * @param data The arbitrary object to encode.
         * @returns The form key/value pair encoding of the given data object.
         */
        private transformRequest(data: any): string {
            var str = [];

            for (var key in data) {
                if (!data.hasOwnProperty(key)) {
                    continue;
                }

                str.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
            }

            return str.join("&");
        }

        /**
         * This is used to generate ubus json rpc data
         *
         */
         private jsonRpc(data: any): string {
             var postData = {
                   jsonrpc: "2.0", 
                   id: 1, 
                   method: "call", 
                   params: [ 
                            data.session, 
                            data.path, 
                            data.methoud, 
                            data.arg
                            ] 
                 };
             return JSON.stringify(postData);
         }

        //#endregion

        //#region Authentication

        /**
         * Used to authenticate with the AlertMe API using the crednetials specified
         * via the preferences. This utilizes the POST /login endpoint.
         */
        public login(): ng.IPromise<any> {
            var q = this.$q.defer(),
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(UbusRpc.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            httpConfig = {
                method: "POST",
                url: this.Preferences.ubusRpcUrl,
                headers: { "Content-Type": "application/json" },
                data: this.jsonRpc({
                                    session: UbusRpc.DEFAULT_RPC_SESSION,
                                    path: "session",
                                    methoud: "login",
                                    arg: {
                                        "username": this.Preferences.ubusRpcUserName,
                                        "password": this.Preferences.ubusRpcPassword
                                    }
                        })
                /*{
                    "jsonrpc": "2.0", 
                    "id": 1, 
                    "method": "call", 
                    "params": [ 
                            UbusRpc.DEFAULT_RPC_SESSION, 
                            "session", 
                            "login", 
                            { 
                                "username": this.Preferences.ubusRpcUserName, 
                                "password": this.Preferences.ubusRpcPassword  
                            } 
                            ] 
                }*/
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<any>) => {
        /*        var respData = JSON.parse(result.data);
                if(respData.result[0] === 0){
                    this.Preferences.ubusRpcSession = respData.result[1].ubus_rpc_session;
                }
*/
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to de-authenticate with the AlertMe API. This utlilizes the POST /logout endpoint.
         */
        public logout(): ng.IPromise<any> {
            var q = this.$q.defer<any>(),
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(UbusRpc.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            httpConfig = {
                method: "POST",
                url: this.Preferences.ubusRpcUrl + "/logout"
            };

            this.$http(httpConfig).then(q.resolve, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Home Status

        /**
         * Used to get information about all of the devices for the current hub (home).
         * This utilizes the GET /widgets/homeStatus endpoint.
         */
        public getGatewayStatus(): ng.IPromise<any> {
            var q = this.$q.defer(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(UbusRpc.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}", this.Preferences.ubusRpcUrl);

            httpConfig = {
                method: "POST",
                url: this.Preferences.ubusRpcUrl,
                headers: { "Content-Type": "application/json" },
                data: this.jsonRpc({
                    session: this.Preferences.ubusRpcSession,
                    path: "system",
                    methoud: "info",
                    arg: {

                    }
                })

            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<any>) => {
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        //#endregion
    }
}
