package com.limani.LuckyFlip.controller;

import com.limani.LuckyFlip.dto.GameStartResponse;
import com.limani.LuckyFlip.dto.GuessResponse;
import com.limani.LuckyFlip.enums.GuessType;
import com.limani.LuckyFlip.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // allow React frontend
public class GameController {

    private final GameService gameService;

    // 🎴 Start New Game
    @PostMapping("/start")
    public GameStartResponse startGame() {
        return gameService.startGame();
    }

    // 🎯 Make Guess — optional timeTaken in seconds (1..10)
    @PostMapping("/{gameId}/guess")
    public GuessResponse makeGuess(
            @PathVariable Long gameId,
            @RequestParam GuessType guess,
            @RequestParam(required = false) Integer time
    ) {
        return gameService.makeGuess(gameId, guess, time);
    }

    // ⏱ Reveal without guessing (timer expired) — shows the revealed card and advances to next round without scoring
    @PostMapping("/{gameId}/reveal")
    public GuessResponse reveal(@PathVariable Long gameId) {
        return gameService.reveal(gameId);
    }
}