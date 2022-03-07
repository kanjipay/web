import './NavBar.css';
import CircleButton, { ButtonTheme } from './CircleButton';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Back from '../assets/icons/Back'

export default function NavBar({ showsBackButton = true, backPath, title, titleElement, leftElements = [], rightElements = [], transparentDepth, opaqueDepth }) {
  const navigate = useNavigate()

  const changesOpacity = transparentDepth && opaqueDepth
  const initialOpacity = changesOpacity ? 0 : 1

  const [opacity, setOpacity] = useState(initialOpacity)

  useEffect(() => {
    const handleScroll = () => {
      const yOffset = window.scrollY
      const newOpacity = Math.max(Math.min((yOffset - transparentDepth) / (opaqueDepth - transparentDepth), 1), 0)

      setOpacity(newOpacity)
    }

    if (changesOpacity) {
      window.addEventListener('scroll', handleScroll)

      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [transparentDepth, opaqueDepth, changesOpacity])

  return (
    <div className='NavBar'>
      <div className='NavBar__content'>
        <div className='NavBar__background' style={{ opacity }} />
        <div className='NavBar__left'>
          {
            showsBackButton && (
              <div className='NavBar__item'>
                <CircleButton Icon={Back} buttonTheme={ButtonTheme.NAVBAR} onClick={() => navigate(backPath ?? -1)} />
              </div>
            )
          }
          { leftElements.map(e => <div className='NavBar__item'>{e}</div>) }
        </div>
        <div className='NavBar__title header-xs'  style={{ opacity }}>
          { title || titleElement }
        </div>
        <div className='NavBar__right'>
          { rightElements.map(e => <div className='NavBar__item'>{e}</div>) }
        </div>
      </div>
    </div>
  )
}