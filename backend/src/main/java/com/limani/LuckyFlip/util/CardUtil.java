package com.limani.LuckyFlip.util;


import java.util.List;
import java.util.Random;

public class CardUtil {

    private static final List<String> CARDS =
            List.of("A","2","3","4","5","6","7","8","9","10","J","Q","K");

    private static final Random RANDOM = new Random();

    public static String randomCard() {
        return CARDS.get(RANDOM.nextInt(CARDS.size()));
    }

    public static int cardValue(String card) {
        return switch (card) {
            case "A" -> 1;
            case "J" -> 11;
            case "Q" -> 12;
            case "K" -> 13;
            default -> Integer.parseInt(card);
        };
    }
}