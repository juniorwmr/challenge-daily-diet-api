-- with teste as (

--         select

--             created_at,

--             on_diet,

--             min(id),

--             max(id),

--             count(*)

--         from (

--                 select

--                     id,

--                     on_diet,

--                     date(created_at) as created_at,

--                     row_number() over (

--                         partition by on_diet

--                         order by

--                             id

--                     ) as seqnum

--                 from snacks

--                 where

--                     on_diet = 1

--             ) t

--         group by

--             on_diet, (id - seqnum),

--             created_at

--         order by

--             on_diet,

--             count(*) desc

--         limit 1

--     )

-- select *

-- from teste

with `snacks_not_on_diet` as (
        select `id`
        from `snacks`
        where
            `user_id` = ?
            and `on_diet` = ?
    ),
    `best_sequence` as (
        select
            `created_at`,
            `on_diet`,
            min(`id`),
            max(`id`),
            count(*)
        from (
                select
                    `id`,
                    `on_diet`,
                    date(created_at) as created_at,
                    row_number() over (
                        partition by `on_diet`
                        order by
                            `id`
                    ) as seqnum
                from `snacks`
                where
                    `user_id` = ?
                    and `on_diet` = ?
            )
        group by
            `on_diet`,
            `created_at`, (id - seqnum)
        order by
            `created_at` desc,
            count(*) desc
        limit 1
    )
select
    count(`snacks`.`id`) as `total`,
    sum(`snacks`.`on_diet`) as `on_diet`,
    count(`snacks_not_on_diet`.`id`) as `not_on_diet`,
    `best_sequence`.*
from `snacks`
    left join `snacks_not_on_diet` on `snacks_not_on_diet`.`id` = `snacks`.`id`
    left join `best_sequence`
where `user_id` = 1
limit 1