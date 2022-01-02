import { LCDClient, MnemonicKey, MsgStoreCode, isTxError, MsgInstantiateContract } from '@terra-money/terra.js';
import * as fs from 'fs';

const mnemonic = new MnemonicKey({
    mnemonic: 'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn'
});


const terra = new LCDClient({
    URL: 'http://localhost:1317',
    chainID: 'localterra'
});
const wallet = terra.wallet(mnemonic);

// console.log(wallet.key.accAddress);

const arkToken = new MsgStoreCode(wallet.key.accAddress,
    fs.readFileSync('../arkane/artifacts/ark_token.wasm').toString('base64')
)

const storeCodeTx = await wallet.createAndSignTx({
    msgs: [arkToken]
});


const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);
console.log(storeCodeTxResult);

if (isTxError(storeCodeTxResult)) {
    throw new Error(`store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`)
}

const {
    store_code: {code_id}
} = storeCodeTxResult.logs[0].eventsByType;

console.log(code_id);


// instantiate the contract
const instantiate = new MsgInstantiateContract(
    wallet.key.accAddress,
    wallet.key.accAddress,
    code_id[0],
    {
        name: "Arkane Protocol",
        symbol: "ARK",
        decimals: 18,
        initial_balances: [
        ],   
    },
    { uluna: 10000000, ukrw: 1000000 }
);

const instantiateTx = await wallet.createAndSignTx({
    msgs: [instantiate],
});

const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

console.log(instantiateTxResult);

if (isTxError(instantiateTxResult)) {
  throw new Error(
    `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
  );
}

const {
    instantiate_contract: { contract_address },
} = instantiateTxResult.logs[0].eventsByType;

console.log(contract_address);

