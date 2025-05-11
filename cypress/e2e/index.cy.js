describe('index E2E', () => {
    Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').as('consoleError');
});
    it('should be load page without errors', () => {
        cy.visit('/pages/');
        cy.get('@consoleError').should('not.be.called');
    });

    it('should сheck for items', () => {
        cy.visit('/pages/');
        cy.get('.game-lobby-form').should('be.visible');

        cy.get('#start-game').should('have.text', "Start Game");

         cy.get("#username").should('be.visible');
    });

    it('test to verify user login functionality', () => {
        cy.visit('/pages/');
        cy.get("#username").type('Alex');
        cy.get("#create-id").click();
        cy.get("#count-ships").type('5');
        cy.get("#start-game").click();
        cy.url().should('include', '/pages/game.html');
    });
    
}) 

describe('WebSocket заглушка для гри', () => {
  beforeEach(() => {
    // Очищаємо localStorage перед кожним тестом
    cy.clearLocalStorage();
  });

  afterEach(() => {
    // Скидаємо заглушку WebSocket після кожного тесту
    cy.window().then((win) => {
      win.WebSocket = null;
    });
  });

  it('Підключення до гри і перевірка обробки відповіді від сервера', () => {
    cy.visit('/pages/game.html?gameId=123', {
      onBeforeLoad(win) {
        // Створюємо об’єкт-заглушку для WebSocket
        const wsStub = {
          readyState: 1,
          sentMessages: [],
          send: cy.stub().callsFake(function (msg) {
            this.sentMessages.push(msg);
            const parsed = JSON.parse(msg);
            if (parsed.event === 'connect') {
              setTimeout(() => {
                this.onmessage?.({
                  data: JSON.stringify({
                    type: 'connectToPlay',
                    payload: {
                      canStart: true,
                      username: parsed.payload.username,
                      countShips: parsed.payload.countShips,
                    },
                  }),
                });
              }, 200);
            }
          }),
          close: cy.stub().callsFake(function () {
            this.readyState = 3;
            this.onclose?.();
          }),
          onopen: null,
          onmessage: null,
          onclose: null,
        };

        // Замінюємо WebSocket на заглушку
        cy.stub(win, 'WebSocket').as('webSocket').returns(wsStub);

        // Налаштовуємо localStorage
        win.localStorage.setItem('username', 'Ivan');
        win.localStorage.setItem('shipsToPlace', '5');

        // Викликаємо onopen після ініціалізації
        setTimeout(() => {
          if (wsStub.onopen) wsStub.onopen();
        }, 100);
      },
    });

    // Перевіряємо відображення імені користувача
    cy.get('#my-username').should('contain', 'Ivan');

    // Перевіряємо відображення gameId
    cy.get('#room-id').should('contain', 'Room id: 123');

    // Чекаємо відправку connect і відповідь connectToPlay
    cy.wait(500);

    // Перевіряємо, що WebSocket відправив повідомлення connect
    cy.get('@webSocket').then((stub) => {
      const wsInstance = stub.getCall(0).returnValue;
      const connectMessage = wsInstance.sentMessages.find(
        (msg) => JSON.parse(msg).event === 'connect'
      );
      expect(connectMessage).to.exist;
      expect(JSON.parse(connectMessage)).to.deep.equal({
        event: 'connect',
        payload: {
          username: 'Ivan',
          gameId: '123',
          countShips: 5,
        },
      });
    });


    // Перевіряємо, що дошки ініціалізовані
    cy.get('#my-board .cell').should('have.length', 100); // Припускаємо дошку 10x10
    cy.get('#enemy-board .cell').should('have.length', 100); // Змінено на 100
  });
});