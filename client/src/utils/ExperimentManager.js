import { GrowthBook } from "@growthbook/growthbook-react";
import axios from "axios";
import { IdentityManager } from "./IdentityManager";
import { useFeature } from "@growthbook/growthbook-react";

export class ExperimentKey {
  static PROCESSING_FEE = "processingfee"
}

export default class ExperimentManager {
  static main = new ExperimentManager()

  constructor() {
    const growthbook = new GrowthBook()

    growthbook.setAttributes({
      id: IdentityManager.main.getPseudoUserId(),
      deviceId: IdentityManager.main.getDeviceId()
    })

    axios.get(`https://cdn.growthbook.io/api/features/${process.env.REACT_APP_GROWTHBOOK_API_KEY}`)
      .then(res => {
        console.log(res.data)
        const { features } = res.data
        growthbook.setFeatures(features)
      })

    this.growthbook = growthbook
  }

  boolean = key => useFeature(key).on
}