module JustinCredible.SmartHomeMobile.Filters {

    /**
     * Formats numbers greater than one thousand to include the K suffix.
     * 
     * Numbers greater than 10,000 will not show decimal places, while numbers
     * between 1,000 and 9,999 will show decimal places unless the number is
     * a multiple of one thousand.
     * 
     * For example:
     *      200   -> 200
     *      2000  -> 2K
     *      1321  -> 1.3K
     *      10700 -> 10K
     */
    export class UptimeFilter {

        public static ID = "Uptime";

        public static filter(input: number): string {

                var totleSeconds:number = input;
                var days = totleSeconds / 3600 / 24;
                var hours = (totleSeconds - days * 24 * 3600) / 3600;
                var minutes = (totleSeconds - days * 24 * 3600 - hours * 3600) / 60;
                var seconds = totleSeconds - days * 24 * 3600 - hours * 3600 - minutes * 60;
                return days +"天"+ hours +"时"+ minutes + "分" + seconds + "秒";

        }
    }
}
