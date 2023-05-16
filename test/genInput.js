const fs = require("fs");
const path = require('path');

const { addLeaf, getTree, initialize, hash, getSiblings } = require("./fmt");

function readJSONFilesInFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    const jsonData = [];

    jsonFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        const fileData = fs.readFileSync(filePath, 'utf-8');

        try {
            const parsedData = JSON.parse(fileData);
            jsonData.push(parsedData);
        } catch (error) {
            console.error(`Error parsing JSON file ${file}: ${error}`);
        }
    });

    return jsonData;
}

function stringToAsciiBytes(str) {
    const asciiBytes = [];

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        asciiBytes.push(charCode);
    }

    return asciiBytes;
}

function byteArrayToHexString(byteArray) {
    const hexChars = [];

    for (let i = 0; i < byteArray.length; i++) {
        const hex = byteArray[i].toString(16).padStart(2, '0');
        hexChars.push(hex);
    }

    return hexChars.join('');
}

function convertStringAsciiToNumber(string) {
    return BigInt("0x".concat(...byteArrayToHexString(stringToAsciiBytes(string)))).toString()
}


const main = async () => {
    /**
     * test gen input file for circuit
     */

    // init tree
    await initialize();
    const tree = getTree();

    // load userInfo Data
    const folderPath = 'test/userInfo';
    const jsonFilesData = readJSONFilesInFolder(folderPath);

    let userInfosCircuit = [];
    let encodeUserInfo;
    let userLeaf;

    /**
     * Encode userInfo
     * - creditCardNumber: convert string to bigint
     * - creditCardExpire: "31/07/24" => 20240731 (int)
     * - ownerName: decode ascii then convert to BigNum
     * - cvv: convert string to int
     * - bank: decode ascii then convert to BigNum
     */
    for (let i = 0; i < jsonFilesData.length; i++) {
        encodeUserInfo = {
            creditCardNumber: parseInt(jsonFilesData[i].creditCardNumber, 10),
            creditCardExpireDate: jsonFilesData[i].creditCardExpireDate,
            ownerName: convertStringAsciiToNumber(jsonFilesData[i].ownerName),
            cvv: parseInt(jsonFilesData[i].cvv, 10),
            bank: convertStringAsciiToNumber(jsonFilesData[i].bank)
        }
        userInfosCircuit.push(encodeUserInfo)
    }
    // console.log(userInfosCircuit)

    for (i = 0; i < jsonFilesData.length; i++) {
        //create user leaf
        userLeaf = hash([userInfosCircuit[i].creditCardNumber, userInfosCircuit[i].creditCardExpireDate, userInfosCircuit[i].ownerName, userInfosCircuit[i].cvv, userInfosCircuit[i].bank])
        //add leaf to tree
        tree.insert(userLeaf);
    }

    // gen input for circuit creating proof  for 1st user
    let userIndex = 0;
    let root = tree.root();
    let siblings = getSiblings(userIndex)
    console.log(siblings)
    const input = {
        creditCardNumber: userInfosCircuit[userIndex].creditCardNumber,
        creditCardExpireDate: userInfosCircuit[userIndex].creditCardExpireDate,
        ownerName: userInfosCircuit[userIndex].ownerName,
        cvv: userInfosCircuit[userIndex].cvv,
        bank: userInfosCircuit[userIndex].bank,
        
        key: userIndex,
        siblings: siblings.map(e => e.toString()),
        root: root,

        availableTime: 20230801
    }

    json = JSON.stringify(input, null, 2);
    fs.writeFile("src/user/input.json", json, (err) => {
        if (err) {
          console.error('Error saving JSON file:', err);
        } else {
          console.log('JSON file saved successfully!');
        }
      });
};

main()
    .then(() => { })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });