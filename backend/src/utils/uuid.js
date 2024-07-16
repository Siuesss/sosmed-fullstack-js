import { v4 as uuidv4 } from 'uuid';

const generateCustomUUID = () => {
    const uuid = uuidv4();
    const now = new Date();
    const month = now.getMonth() + 1;
    const yearAlphaNumeric = convertYearToAlphaNumeric(now.getFullYear());
    // const hourAlphaNumeric = convertToAlphaNumeric(now.getHours());
    // const minuteAlphaNumeric = convertToAlphaNumeric(now.getMinutes());
    // const secondAlphaNumeric = convertToAlphaNumeric(now.getSeconds());

    // ${hourAlphaNumeric}${minuteAlphaNumeric}${secondAlphaNumeric}
    const timestamp = `${yearAlphaNumeric}${month.toString().padStart(2, '0')}`;

    return `${timestamp}-${uuid}`;
};

const convertYearToAlphaNumeric = (year) => {
    return (year - 2023).toString().padStart(2, '0');
};

// const convertToAlphaNumeric = () => {
//     const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

//     const firstCharIndex = Math.floor(value / 10);
//     const secondCharIndex = value % 10;

//     return chars.charAt(firstCharIndex) + chars.charAt(secondCharIndex);
// };

export { generateCustomUUID };