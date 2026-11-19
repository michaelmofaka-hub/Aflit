
function Popup({ message, type }) {
  return (
    <div className={`popup_window ${type}`}>
      {message}
    </div>
  )
}

export default Popup
