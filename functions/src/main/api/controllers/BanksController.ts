import BaseController from "../../../shared/BaseController"
import { fetchBankData } from "../../../shared/utils/crezcoClient"
import LoggingController from "../../../shared/utils/loggingClient"

export class BanksController extends BaseController {
  index = async (req, res, next) => {
    try {
      const { countryCode } = req.params;

      const logger = new LoggingController("Get Crezco bank data");
      logger.log(`Getting crezco bank data for country code ${countryCode}`);

      const bankData = await fetchBankData(countryCode);

      logger.log(`Retrieved ${bankData.length} banks`);

      return res.status(200).json(bankData)
    } catch (err) {
      next(err);
    }
  }
}
