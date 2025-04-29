 function popup(popuplink, popup) {
    popuplink.addEventListener("click", (e) => {
        e.preventDefault();
        showPopup(popup);

        popup.addEventListener("click", (e) => {
            if(e.target.classList.contains("popup") || e.target.classList.contains("popup-close")) {
                popup.classList.remove("active");
                document.body.classList.remove("lock");
            }
        })
    })
}


function showPopup(popup) {
    popup.classList.add("active");
    document.body.classList.add("lock");
   
}

export {popup, showPopup};