import styled, { css } from 'styled-components'

const rcSlider = css`
  .rc-slider {
    height: 35px;
  }

  .rc-slider-rail,
  .rc-slider-track {
    border-radius: 0;
    height: 24px;
  }

  .rc-slider-track {
    background: #4c4da7;
  }

  .rc-slider-handle {
    width: 2px;
    height: 32px;
    border-radius: 0;
    border: 0;
    background: #4c4da7;
  }
`

export const Controls = styled.div`
  width: 305px;
  border-left: 1px solid #d7d7d7;
  position: relative;
  overflow-y: scroll;

  /* rc-slider */
  ${rcSlider}
`

export const DashedLine = styled.div`
  border: 0.5px dashed #d7d7d7;
  margin: 20px -24px;
`

export const Title = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
  text-transform: uppercase;
  display: flex;
  align-items: center;

  &:only-child {
    margin-bottom: 0;
  }
`

export const ClearButton = styled.button`
  background: transparent;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  cursor: pointer;
  border: 0;
  padding: 0;
  position: relative;
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 0.7;
  }

  &::before,
  &::after {
    content: '';
    width: 2px;
    height: 14px;
    position: absolute;
    top: 1px;
    left: calc(50% - 1px);
    display: block;
    background: #000;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
`;

export const Description = styled.p`
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0.02em;
  margin-top: 10px;
`
