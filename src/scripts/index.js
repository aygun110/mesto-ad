import "../pages/index.css";

import {
  enableValidation,
  clearValidation,
} from "./components/validation.js";

import {
  createCardElement,
  deleteCardElement,
  isCardLiked,
  updateLikeView,
} from "./components/card.js";

import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  removeCard,
  changeLikeCardStatus,
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const logo = document.querySelector(".logo");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUsersTitle = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

let currentUserId;

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const renderLoading = (button, isLoading, loadingText, defaultText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template").content;
  const item = template.querySelector(".popup__info-item").cloneNode(true);

  item.querySelector(".popup__info-term").textContent = term;
  item.querySelector(".popup__info-description").textContent = description;

  return item;
};

const createUserElement = (userName) => {
  const template = document.querySelector("#popup-info-user-preview-template").content;
  const item = template.querySelector(".popup__list-item").cloneNode(true);

  item.textContent = userName;

  return item;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const users = cards.map((card) => card.owner);

      const uniqueUsers = users.filter(
        (user, index, array) =>
          index === array.findIndex((item) => item._id === user._id)
      );

      const cardsCountByUser = users.reduce((acc, user) => {
        acc[user._id] = (acc[user._id] || 0) + 1;
        return acc;
      }, {});

      const maxCardsCount = Math.max(...Object.values(cardsCountByUser));

      usersStatsModalTitle.textContent = "Статистика пользователей";
      usersStatsModalInfoList.textContent = "";
      usersStatsModalUsersList.textContent = "";

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length),
        createInfoString(
          "Первая создана:",
          formatDate(new Date(cards[cards.length - 1].createdAt))
        ),
        createInfoString(
          "Последняя создана:",
          formatDate(new Date(cards[0].createdAt))
        ),
        createInfoString("Всего пользователей:", uniqueUsers.length),
        createInfoString("Максимум карточек от одного:", maxCardsCount)
      );

      usersStatsModalUsersTitle.textContent = "Все пользователи:";

      uniqueUsers.forEach((user) => {
        usersStatsModalUsersList.append(createUserElement(user.name));
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  removeCard(cardId)
    .then(() => {
      deleteCardElement(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, likeButton, likeCount) => {
  changeLikeCardStatus(cardId, isCardLiked(likeButton))
    .then((updatedCard) => {
      updateLikeView(updatedCard, likeButton, likeCount);
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
  });

  placesWrap[method](cardElement);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Сохранение...", "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Сохранение...", "Сохранить");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Создание...", "Создать");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Создание...", "Создать");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
logo.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const allPopups = document.querySelectorAll(".popup");

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);