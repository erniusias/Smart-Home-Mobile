module JustinCredible.SmartHomeMobile.Controllers {

    export class DashboardConfigController extends BaseController<ViewModels.DashboardConfigViewModel> {

        //#region Injection

        public static ID = "DashboardConfigController";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.Utilities.ID,
                Services.UiHelper.ID,
                Services.Preferences.ID,
                Services.DashboardHelper.ID,
                Services.HubDataSource.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private Preferences: Services.Preferences,
            private DashboardHelper: Services.DashboardHelper,
            private HubDataSource: Services.HubDataSource) {
            super($scope, ViewModels.DashboardConfigViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.viewModel.hasChanges = false;
            this.viewModel.showToolbar = true;
            this.viewModel.floorplanImageUrl = this.Preferences.dashboardFloorplanImageUrl;
            this.viewModel.items = this.Preferences.dashboardItems;

            if (this.HubDataSource.dashboardDevices == null
                || this.HubDataSource.dashboardDevicesLastUpdated == null
                || moment().diff(this.HubDataSource.dashboardDevicesLastUpdated, "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(this.HubDataSource.dashboardDevices);
                this.updateItemList(this.HubDataSource.dashboardDevices);
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshDashboardDevices().then((result: Models.DashboardDevices) => {
                this.viewModel.isRefreshing = false;
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(result);
                this.viewModel.lastUpdated = this.HubDataSource.dashboardDevicesLastUpdated.toDate();

                this.updateItemList(result);
            }, () => {
                this.viewModel.isRefreshing = false;
            });
        }

        private updateItemList(dashboardDevices: Models.DashboardDevices): void {

            if (!this.viewModel.items) {
                this.viewModel.items = [];
            }

            // Flatten the different device types into a single dictionary of devices by ID.
            let devices = this.DashboardHelper.getDeviceDictionary(dashboardDevices);

            // Flatten the items list into a dictionary of items by device ID.
            let items = this.DashboardHelper.getItemsDictionary(this.viewModel.items);

            // Keeps track of the X and Y coordiates for new items so they don't all overlap
            // and/or go off of the screen.
            let newItemXPositionCounter = Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_START;
            let newItemYPositionCounter = Constants.Dashboard.ITEM_DEFAULT_VERTICAL_START;

            // Keeps track of if a changed has occurred or not.
            let hasChanged = false;

            // First, loop over each of the devices and add items if they don't exist yet.
            Object.keys(devices).forEach((deviceId: string) => {

                if (items[deviceId]) {
                    // Device already has a corresponding item, so we'll update it.

                    if (items[deviceId].name !== devices[deviceId].name) {
                        hasChanged = true;
                    }

                    items[deviceId].name = devices[deviceId].name;
                    items[deviceId].missing = false;
                    items[deviceId].isBusy = false;
                }
                else {
                    // If this is a new device, add an item for it.
                    let newItem = new Models.DashboardItem();
                    newItem.deviceId = deviceId;
                    newItem.type = devices[deviceId].type;
                    newItem.name = devices[deviceId].name;
                    newItem.isBusy = false;
                    newItem.visible = true;
                    newItem.missing = false;

                    // Calculate the potential X position for this button.
                    var nextXPosition = newItemXPositionCounter + Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_SPACING;

                    if ((nextXPosition + Constants.Dashboard.ITEM_WIDTH) >= screen.width) {
                        // If the button would be positioned off of the right of the screen
                        // then we'll wrap it around to the next row.
                        newItemXPositionCounter = Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_START;
                        newItemYPositionCounter += Constants.Dashboard.ITEM_DEFAULT_VERTICAL_SPACING;
                    }
                    else {
                        newItemXPositionCounter += Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_SPACING;
                    }

                    newItem.x = newItemXPositionCounter;
                    newItem.y = newItemYPositionCounter;

                    items[deviceId] = newItem;

                    hasChanged = true;
                }
            });

            // Look for items whose devices are no longer present.
            Object.keys(items).forEach((deviceId: string) => {

                if (!devices[deviceId]) {
                    items[deviceId].missing = true;
                    hasChanged = true;
                }
            });

            this.viewModel.items = [];

            // Convert back to an array for the view model.
            Object.keys(items).forEach((deviceId: string) => {
                this.viewModel.items.push(items[deviceId]);
            });

            // Store the device dictionary so we can use it to determine icons etc.
            this.viewModel.devices = devices;

            if (hasChanged) {
                this.viewModel.hasChanges = true;
            }
        }

        //#endregion

        //#region Attribute/Expression Properties and Helpers

        public getIconForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getIconForItem(item, device);
        }

        public getColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getColorForItem(item, device);
        }

        public getBorderColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getBorderColorForItem(item, device);
        }

        //#endregion

        //#region Events

        protected toggleToolbar_click(): void {
            this.viewModel.showToolbar = !this.viewModel.showToolbar;
        }

        protected refreshDevices_click(): void {
            this.refresh();
        }

        protected resetLayout_click(): void {

            let message = "Are you sure you want to reset the layout of all of the devices?";
            let title = "Reset Layout";

            this.UiHelper.confirm(message, title).then((result: string) => {

                if (result === Constants.Buttons.No) {
                    return;
                }

                // Keeps track of the X and Y coordiates for new items so they don't all overlap
                // and/or go off of the screen.
                let itemXPositionCounter = Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_START;
                let itemYPositionCounter = Constants.Dashboard.ITEM_DEFAULT_VERTICAL_START;

                this.viewModel.items.forEach((item: Models.DashboardItem) => {

                    // Calculate the potential X position for this button.
                    var nextXPosition = itemXPositionCounter + Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_SPACING;

                    if ((nextXPosition + Constants.Dashboard.ITEM_WIDTH) >= screen.width) {
                        // If the button would be positioned off of the right of the screen
                        // then we'll wrap it around to the next row.
                        itemXPositionCounter = Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_START;
                        itemYPositionCounter += Constants.Dashboard.ITEM_DEFAULT_VERTICAL_SPACING;
                    }
                    else {
                        itemXPositionCounter += Constants.Dashboard.ITEM_DEFAULT_HORIZONTAL_SPACING;
                    }

                    item.x = itemXPositionCounter;
                    item.y = itemYPositionCounter;
                });

                this.viewModel.hasChanges = true;
            });
        }

        protected setFloorplanImage_click(): void {
            let message = "Enter the URL to an image to use for the dashboard floorplan.";
            let title = "Set Floorplan Image";

            this.UiHelper.prompt(message, title, null, this.viewModel.floorplanImageUrl)
                .then((result: Models.KeyValuePair<string, string>) => {

                if (result.key === Constants.Buttons.OK) {
                    this.viewModel.floorplanImageUrl = result.value;
                    this.viewModel.hasChanges = true;
                }
            });
        }

        protected save_click(): void {
            let message = "Are you sure you want to save the dashboard configuration?";

            this.UiHelper.confirm(message).then((result: string) => {
                if (result === Constants.Buttons.Yes) {
                    this.Preferences.dashboardItems = this.viewModel.items;
                    this.Preferences.dashboardFloorplanImageUrl = this.viewModel.floorplanImageUrl;
                    this.viewModel.hasChanges = false;
                    this.UiHelper.alert("Dashboard configuration saved!");
                }
            });
        }

        protected visible_click(item: Models.DashboardItem): void {
            this.viewModel.hasChanges = true;
        }

        protected item_reposition(item: Models.DashboardItem): void {
            this.viewModel.hasChanges = true;
        }

        protected item_mouseDown(item: Models.DashboardItem): void {
            this.viewModel.selectedItem = item;
        }

        protected item_click(item: Models.DashboardItem): void {
            this.viewModel.selectedItem = item;
        }

        protected remove_click(item: Models.DashboardItem): void {
            let message = this.Utilities.format("Are you sure you want remove the following missing device?\n\n{0}", item.name);

            this.UiHelper.confirm(message).then((result: string) => {
                if (result === Constants.Buttons.Yes) {
                    _.remove(this.viewModel.items, { deviceId: item.deviceId });
                    this.viewModel.selectedItem = null;
                    this.viewModel.hasChanges = true;
                    this.UiHelper.alert("Device removed.");
                }
            });
        }

        //#endregion
    }
}
