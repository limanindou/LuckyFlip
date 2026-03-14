package com.limani.LuckyFlip.model;

import com.limani.LuckyFlip.enums.GameStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int balance;

    private String firstCard;

    private String secondCard;

    @Enumerated(EnumType.STRING)
    private GameStatus status;// PLAYING or GAME_OVER
}
