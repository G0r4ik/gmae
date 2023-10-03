<template>
  <div class="about-game container">
    <h1 class="about-game__title">Об игре</h1>
    <p class="about-game__p">
      Суть игры заключается в том, чтобы захватить как можно больше квадратиков.
    </p>
    <p class="about-game__p">
      У угловых клеток, есть всего лишь две стороны, если две стороны будут
      захвачены одной сторой то клетка передается игроку который поставил рядом
      с ней линии, иначе будет ничейная клетка
    </p>
    <p class="about-game__p">
      По такому же приницпу обстоят дела и с другими клетками
    </p>
    <p class="about-game__p">
      В игру можно играть вдвоем, а так же с глупым компьютером.
    </p>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style>
.about-game {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
