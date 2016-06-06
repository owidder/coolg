select sk.`name` as 'Skill', sku.`name` as 'Skill-Unterkategorie', msk.`skill_bewertung_id` as 'Bewertung', st.`name` as 'Standort', msk.`skill_dauer_id` as 'Skill Dauer', count(*) as 'Anzahl Mitarbeiter' from
`MitarbeiterSkill` msk
inner join `Skill` sk on msk.`skill_id` = sk.`id`
inner join `SkillUnterkategorie` sku on sk.`skill_unterkategorie_id` = sku.`id`
inner join `Mitarbeiter` m on msk.`mitarbeiter_id` = m.`id`
inner join `Standort` st on m.`standort_id` = st.`id`
group by sk.`name`, sku.`name`, msk.`skill_bewertung_id`, st.`name`, msk.`skill_dauer_id`
order by sk.`name`, sku.`name`, msk.`skill_bewertung_id`, st.`name`, msk.`skill_dauer_id`
