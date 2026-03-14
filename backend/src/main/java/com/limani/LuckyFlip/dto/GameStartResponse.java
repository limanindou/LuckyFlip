package com.limani.LuckyFlip.dto;

import com.limani.LuckyFlip.enums.GameStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GameStartResponse {
    private Long gameId;
    private int balance;
    private String firstCard;
    private GameStatus status;
}
