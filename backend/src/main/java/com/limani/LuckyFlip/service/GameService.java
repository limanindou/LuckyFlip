package com.limani.LuckyFlip.service;

import com.limani.LuckyFlip.dto.GameStartResponse;
import com.limani.LuckyFlip.dto.GuessResponse;
import com.limani.LuckyFlip.enums.GameStatus;
import com.limani.LuckyFlip.enums.GuessType;
import com.limani.LuckyFlip.model.GameSession;
import com.limani.LuckyFlip.repository.GameSessionRepository;
import com.limani.LuckyFlip.util.CardUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameSessionRepository repository;

    private static final int START_BALANCE = 10;
    private static final int WIN_AMOUNT = 1; // kept for compatibility (not used when time provided)
    private static final int LOSE_AMOUNT = 1;

    // Time rewards mapping (seconds -> R)
    private static final Map<Integer, Integer> TIME_REWARDS = Map.of(
            1, 10,
            2, 8,
            3, 7,
            4, 6,
            5, 5,
            6, 4,
            7, 3,
            8, 2,
            9, 1,
            10, 0
    );

    // Common messages
    private static final String GAME_NOT_FOUND = "Game not found";

    // 🎴 Start New Game
    public GameStartResponse startGame() {

        GameSession session = GameSession.builder()
                .balance(START_BALANCE)
                .firstCard(CardUtil.randomCard())
                .secondCard(CardUtil.randomCard())
                .status(GameStatus.PLAYING)
                .build();

        session = repository.save(session);

        return GameStartResponse.builder()
                .gameId(session.getId())
                .balance(session.getBalance())
                .firstCard(session.getFirstCard())
                .status(session.getStatus())
                .build();
    }

    // Legacy makeGuess: preserve old behavior for tests and callers that don't pass time
    public GuessResponse makeGuess(Long gameId, GuessType guess) {
        GameSession session = repository.findById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, GAME_NOT_FOUND));

        if (session.getStatus() == GameStatus.GAME_OVER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Game is already over");
        }

        // Capture the revealed card before modifying the session
        String revealed = session.getSecondCard();

        int firstValue = CardUtil.cardValue(session.getFirstCard());
        int secondValue = CardUtil.cardValue(revealed);

        boolean win = switch (guess) {
            case HIGHER -> secondValue > firstValue;
            case LOWER  -> secondValue < firstValue;
            case DRAW   -> secondValue == firstValue;
        };

        if (win) {
            if (guess == GuessType.DRAW) {
                // Correct DRAW doubles the player's current balance
                session.setBalance(session.getBalance() * 2);
            } else {
                session.setBalance(session.getBalance() + WIN_AMOUNT);
            }
        } else {
            session.setBalance(session.getBalance() - LOSE_AMOUNT);
        }

        // Check for game over
        if (session.getBalance() <= 0) {
            session.setStatus(GameStatus.GAME_OVER);
            repository.save(session);
            return GuessResponse.builder()
                    .revealedCard(revealed)
                    .firstCard(session.getFirstCard())
                    .secondCard(null)
                    .result(win ? "WIN" : "LOSE")
                    .balance(session.getBalance())
                    .status(session.getStatus())
                    .build();
        }

        // Prepare next round
        session.setFirstCard(CardUtil.randomCard());
        session.setSecondCard(CardUtil.randomCard());
        session = repository.save(session);

        return GuessResponse.builder()
                .revealedCard(revealed)
                .firstCard(session.getFirstCard())
                .secondCard(null)
                .result(win ? "WIN" : "LOSE")
                .balance(session.getBalance())
                .status(session.getStatus())
                .build();
    }

    // 🎯 Player Makes Guess with optional timeTaken (seconds)
    public GuessResponse makeGuess(Long gameId, GuessType guess, Integer timeTaken) {
        GameSession session = repository.findById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, GAME_NOT_FOUND));

        if (session.getStatus() == GameStatus.GAME_OVER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Game is already over");
        }

        // Save the revealed card (the one the player guessed against)
        String revealed = session.getSecondCard();

        int firstValue = CardUtil.cardValue(session.getFirstCard());
        int secondValue = CardUtil.cardValue(revealed);

        boolean win = switch (guess) {
            case HIGHER -> secondValue > firstValue;
            case LOWER  -> secondValue < firstValue;
            case DRAW   -> secondValue == firstValue;
        };

        // Determine reward based on timeTaken (if null -> treat as 10 seconds)
        int time = 10;
        if (timeTaken != null) {
            time = Math.max(1, Math.min(10, timeTaken));
        }
        int reward = TIME_REWARDS.getOrDefault(time, 0);

        String result;
        if (win) {
            if (guess == GuessType.DRAW) {
                // Correct DRAW doubles the player's current balance
                session.setBalance(session.getBalance() * 2);
            } else {
                // award time-based reward
                session.setBalance(session.getBalance() + reward);
            }
            result = "WIN";
        } else {
            session.setBalance(session.getBalance() - LOSE_AMOUNT);
            result = "LOSE";
        }

        // Check for game over
        if (session.getBalance() <= 0) {
            session.setStatus(GameStatus.GAME_OVER);
            repository.save(session);

            return GuessResponse.builder()
                    .revealedCard(revealed)
                    .firstCard(session.getFirstCard())
                    .secondCard(null)
                    .result(result)
                    .balance(session.getBalance())
                    .status(session.getStatus())
                    .build();
        }

        // Prepare next round (generate new cards) but do not expose the next secondCard in response
        session.setFirstCard(CardUtil.randomCard());
        session.setSecondCard(CardUtil.randomCard());

        session = repository.save(session);

        return GuessResponse.builder()
                .revealedCard(revealed)
                .firstCard(session.getFirstCard())
                .secondCard(null)
                .result(result)
                .balance(session.getBalance())
                .status(session.getStatus())
                .build();
    }

    // ⏱ Reveal the second card due to timer expiry; advances session without scoring
    public GuessResponse reveal(Long gameId) {
        GameSession session = repository.findById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, GAME_NOT_FOUND));

        if (session.getStatus() == GameStatus.GAME_OVER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Game is already over");
        }

        String revealed = session.getSecondCard();

        // Prepare next round (generate new cards) but do not expose the next secondCard in response
        session.setFirstCard(CardUtil.randomCard());
        session.setSecondCard(CardUtil.randomCard());

        session = repository.save(session);

        return GuessResponse.builder()
                .revealedCard(revealed)
                .firstCard(session.getFirstCard())
                .secondCard(null)
                .result(null)
                .balance(session.getBalance())
                .status(session.getStatus())
                .build();
    }
}