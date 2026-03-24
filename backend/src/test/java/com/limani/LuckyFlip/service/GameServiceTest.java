package com.limani.LuckyFlip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.limani.LuckyFlip.dto.GameStartResponse;
import com.limani.LuckyFlip.dto.GuessResponse;
import com.limani.LuckyFlip.enums.GameStatus;
import com.limani.LuckyFlip.enums.GuessType;
import com.limani.LuckyFlip.model.GameSession;
import com.limani.LuckyFlip.repository.GameSessionRepository;

@SpringBootTest
@Transactional
public class GameServiceTest {

    @Autowired
    private GameService gameService;

    @Autowired
    private GameSessionRepository repository;

    @Test
    void testStartGame() {
        GameStartResponse resp = gameService.startGame();
        assertNotNull(resp);
        assertNotNull(resp.getGameId());
        assertEquals(10, resp.getBalance());
        assertNotNull(resp.getFirstCard());
        assertEquals(GameStatus.PLAYING, resp.getStatus());
    }

    @Test
    void testMakeGuessHigherWin() {
        GameSession s = GameSession.builder()
                .balance(10)
                .firstCard("5")
                .secondCard("7")
                .status(GameStatus.PLAYING)
                .build();

        s = repository.save(s);

        GuessResponse resp = gameService.makeGuess(s.getId(), GuessType.HIGHER);

        assertNotNull(resp);
        assertEquals("WIN", resp.getResult());
        assertEquals(11, resp.getBalance());
        assertEquals(GameStatus.PLAYING, resp.getStatus());
    }

    @Test
    void testMakeGuessLoseAndGameOver() {
        GameSession s = GameSession.builder()
                .balance(1)
                .firstCard("K") // 13
                .secondCard("Q") // 12
                .status(GameStatus.PLAYING)
                .build();

        s = repository.save(s);

        GuessResponse resp = gameService.makeGuess(s.getId(), GuessType.HIGHER);

        assertNotNull(resp);
        assertEquals("LOSE", resp.getResult());
        assertEquals(0, resp.getBalance());
        assertEquals(GameStatus.GAME_OVER, resp.getStatus());
    }

    @Test
    void testMakeGuessDrawWin() {
        GameSession s = GameSession.builder()
                .balance(5)
                .firstCard("8")
                .secondCard("8")
                .status(GameStatus.PLAYING)
                .build();

        s = repository.save(s);

        GuessResponse resp = gameService.makeGuess(s.getId(), GuessType.DRAW);

        assertNotNull(resp);
        assertEquals("WIN", resp.getResult());
        assertEquals(10, resp.getBalance());
        assertEquals(GameStatus.PLAYING, resp.getStatus());
    }
}

