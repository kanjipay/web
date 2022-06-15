import BaseController from "../../../shared/BaseController";
import { fetchBankData } from "../../../shared/utils/crezcoClient";

export class BanksController extends BaseController {
  index = async (req, res, next) => {
    try {
      const { countryCode } = req.params
      const bankData = await fetchBankData(countryCode)

      return res.status(200).json(bankData);
    } catch (err) {
      next(err)
    }
  }
}