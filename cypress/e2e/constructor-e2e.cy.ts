describe('Тестирование конструктора бургеров', () => {
  const baseUrl = Cypress.config('baseUrl')!;
  const selectors = {
    modal: '[data-cy="modal"]',
    overlay: '[data-cy="modal-overlay"]',
    bun: '[data-cy="bun"]',
    ingredients: '[data-cy="ingredients"]',
    bunConstructor: '[data-cy="bun-constructor"]',
    itemConstructor: '[data-cy="ingredients-constructor"]'
  };

  const bunName = 'Краторная булка N-200i';
  const fillingName = 'Филе Люминесцентного тетраодонтимформа';
  const sauceName = 'Соус традиционный галактический';

  beforeEach(() => {
    cy.fixture('ingredients.json').then((data) => {
      cy.intercept('GET', 'api/ingredients', { statusCode: 200, body: data });
    });

    cy.fixture('user.json').then((data) => {
      cy.intercept('GET', 'api/auth/user', { statusCode: 200, body: data }).as('fetchUser');
    });

    cy.fixture('order.json').then((data) => {
      cy.intercept('POST', 'api/orders', { statusCode: 200, body: data }).as('createOrder');
    });

    cy.setCookie('accessToken', 'exampleAccessToken');
    cy.setCookie('refreshToken', 'exampleRefreshToken');
    cy.visit(baseUrl);
  });

  it('открывает и закрывает модальное окно по кнопке и оверлею', () => {
    cy.contains('li', bunName).click();
    cy.get(selectors.modal).should('contain', bunName);
    cy.get(selectors.modal).find('button').click();
    cy.get(selectors.modal).should('not.exist');

    cy.contains('li', fillingName).click();
    cy.get(selectors.modal).should('contain', fillingName);
    cy.get(selectors.overlay).click({ force: true });
    cy.get(selectors.modal).should('not.exist');
  });

  it('добавляет булку в конструктор', () => {
    cy.get(selectors.bunConstructor).should('not.contain', bunName);
    cy.contains('li', bunName).contains('Добавить').click();
    cy.get(selectors.bun).should('contain', bunName);
  });

  it('добавляет начинку и соус в конструктор', () => {
    cy.get(selectors.bunConstructor).should('not.contain', bunName);
    cy.contains('li', bunName).contains('Добавить').click();
    cy.get(selectors.bun).should('contain', bunName);

    cy.get(selectors.ingredients).should('not.contain', fillingName);
    cy.contains('li', fillingName).contains('Добавить').click();
    cy.get(selectors.ingredients).should('contain', fillingName);

    cy.get(selectors.ingredients).should('not.contain', sauceName);
    cy.contains('li', sauceName).contains('Добавить').click();
    cy.get(selectors.ingredients).should('contain', sauceName);
  });

  describe('Оформление заказа', () => {
    it('создает заказ и очищает конструктор', () => {
      cy.get(selectors.bunConstructor).should('not.contain', bunName);
      cy.contains('li', bunName).contains('Добавить').click();
      cy.get(selectors.bun).should('contain', bunName);

      cy.get(selectors.ingredients).should('not.contain', fillingName);
      cy.contains('li', fillingName).contains('Добавить').click();
      cy.get(selectors.ingredients).should('contain', fillingName);

      cy.get(selectors.ingredients).should('not.contain', sauceName);
      cy.contains('li', sauceName).contains('Добавить').click();
      cy.get(selectors.ingredients).should('contain', sauceName);

      cy.contains('button', 'Оформить заказ').click();
      cy.wait('@createOrder');

      cy.get(selectors.modal).should('contain', '12345');
      cy.get(selectors.modal).find('button').click();
      cy.get(selectors.modal).should('not.exist');

      cy.get(selectors.bunConstructor).should('contain', 'Выберите булки');
      cy.get(selectors.itemConstructor).should('contain', 'Выберите начинку');
    });

    afterEach(() => {
      cy.clearCookie('accessToken');
      cy.clearCookie('refreshToken');
    });
  });
});
