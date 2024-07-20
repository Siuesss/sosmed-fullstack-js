import { v4 as uuidv4 } from 'uuid';

const generateCustomUUID = () => {
    const uuid = uuidv4();
    const now = new Date();
    const month = now.getMonth() + 1;
    const yearAlphaNumeric = convertYearToAlphaNumeric(now.getFullYear());
    const timestamp = `${yearAlphaNumeric}${month.toString().padStart(2, '0')}`;

    return `${timestamp}-${uuid}`;
};

const convertYearToAlphaNumeric = (year) => {
    return (year - 2023).toString().padStart(2, '0');
};


export { generateCustomUUID };