const cardTemplate = document.querySelector("#card-template").content;

export const isCardLiked = (likeButton) => {
  return likeButton.classList.contains("card__like-button_is-active");
};

export const updateLikeView = (cardData, likeButton, likeCount) => {
  likeButton.classList.toggle("card__like-button_is-active");
  likeCount.textContent = cardData.likes.length;
};

export const deleteCardElement = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  cardData,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  likeCount.textContent = cardData.likes.length;

  if (cardData.likes.some((user) => user._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardData._id, cardElement);
    });
  }

  likeButton.addEventListener("click", () => {
    onLikeIcon(cardData._id, likeButton, likeCount);
  });

  cardImage.addEventListener("click", () => {
    onPreviewPicture(cardData);
  });

  return cardElement;
};