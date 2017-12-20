import {Currency} from './Currency';
import {Split} from './Split';
export type SplitcoinContract = {
	name: string;
	in_currency: Currency;
	deposit_address: string;
	contract_address: string;
	splits: Split;
};
