package com.limani.LuckyFlip.dto;

import com.limani.LuckyFlip.enums.GameStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GuessResponse {
    private String secondCard;
    private String firstCard;
    private String revealedCard; // the card that was revealed during the guess
    private String result; // WIN or LOSE
    private int balance;
    private GameStatus status;
}
