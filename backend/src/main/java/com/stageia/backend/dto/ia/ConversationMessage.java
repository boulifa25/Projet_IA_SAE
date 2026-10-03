package com.stageia.backend.dto.ia;

/**
 * Message générique d'une conversation, indépendant du fournisseur IA (cf. rapport,
 * section 6.3 : le fournisseur doit rester remplaçable).
 * role vaut "user" (message de l'utilisateur) ou "model" (réponse précédente de l'IA).
 */
public record ConversationMessage(String role, String contenu) {
}
