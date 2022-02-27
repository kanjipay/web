import Spacer from '../../../components/Spacer'
import './MenuSection.css'

export default function MenuSection({ section, children }) {
  return (
    <div className='MenuSection'>
      <h2 className='MenuSection__title header-m'>{section.name}</h2>
      <Spacer y={1} />
      {children}
    </div>
  )
}