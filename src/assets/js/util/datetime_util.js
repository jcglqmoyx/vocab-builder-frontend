import {dayjs} from "element-plus";

const formatDate = (row) => {
    const date = row['date_to_review'].toString();
    return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6);
}
const formatDateTime = (row, column) => {
    return dayjs(row[column.property]).format('YYYY-MM-DD HH:mm:ss');
}


const getHomepageImageUrlKey = (date) => {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return 'homepage_image_url_' + year + month + day;
}
export {formatDate, formatDateTime, getHomepageImageUrlKey}