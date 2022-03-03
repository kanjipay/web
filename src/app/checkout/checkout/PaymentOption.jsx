import Spacer from '../../../components/Spacer'
import MainButton from '../../../components/MainButton'
import { ButtonTheme } from '../../../components/CircleButton'
import './PaymentOption.css'


export default function PaymentOption({ title, body, Icon, buttonTheme, ...props}) {
  return <div className="PaymentOption" {...props}>
    <h3 className="header-xs" style={{ textAlign: "center" }}>{title}</h3>
    <Spacer y={2} />
    <p className="text-body">{body}</p>
    <Spacer y={2} />
    <MainButton title="Choose" buttonTheme={buttonTheme}/>
  </div>
}