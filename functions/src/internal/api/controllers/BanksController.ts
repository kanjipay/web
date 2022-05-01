
import BaseController from "../../../shared/BaseController";
import { fetchBankData } from "../../../shared/utils/crezcoClient";

export default class BanksController extends BaseController {
  index = async (req, res, next) => {
    try {
      const bankData = await fetchBankData()
      
      return res.status(200).json(bankData);
    } catch (err) {
      next(err)
    }
  }
}