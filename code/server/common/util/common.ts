export default class CommonUtil {
    static pageTotal(rowCount:number, pageSize:number):number {
        if (rowCount == null) {
            return 0;
        } else {
            if (pageSize != 0 &&
                rowCount % pageSize == 0) {
                return Math.floor(rowCount / pageSize);
            }
            if (pageSize != 0 &&
                rowCount % pageSize != 0) {
                return Math.floor(rowCount / pageSize) + 1;
            }
        }
    }
}