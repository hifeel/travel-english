# drop

레슨 JSON을 여기에 올리면 됩니다. 파일 이름은 아무거나 상관없습니다.

푸시되면 워크플로가 다음 번호를 붙여 `data/lessons/NN.json` 으로 옮기고, 빠진
`id`·`slug`·`audio` 를 채우고, 음성을 만들고, 여기서 파일을 지웁니다.

필요한 건 `title_en`, `title_ko`, `subtitle`, `desc`, `turns` 입니다. `turns` 의 각
항목은 `role`(you/them), `speaker`, `en`, `ko` 를 갖습니다. `audio` 는 적지 않아도
됩니다 — 없으면 자동으로 배정됩니다.
